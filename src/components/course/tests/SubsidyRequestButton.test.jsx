import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { ToastsContext } from '../../Toasts/ToastsProvider';
import SubsidyRequestButton from '../SubsidyRequestButton';
import * as entepriseAccessService from '../../enterprise-subsidy-requests/data/service';
import { SUBSIDY_REQUEST_STATE, SUBSIDY_TYPE } from '../../../constants';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import {
  queryRequestsContextQueryKey,
  useBrowseAndRequestConfiguration,
  useCourseMetadata,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
} from '../../app/data';
import {
  useBrowseAndRequestCatalogsApplicableToCourse,
  useUserSubsidyApplicableToCourse,
  useUserHasSubsidyRequestForCourse,
} from '../data/hooks';

jest.mock('../../enterprise-subsidy-requests/data/service');

const mockInvalidateQueries = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));
useQueryClient.mockReturnValue({
  invalidateQueries: mockInvalidateQueries,
});

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useBrowseAndRequestConfiguration: jest.fn(),
  useCourseMetadata: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
}));
jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useUserSubsidyApplicableToCourse: jest.fn(),
  useBrowseAndRequestCatalogsApplicableToCourse: jest.fn(),
  useUserHasSubsidyRequestForCourse: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockCourseKey = 'edx+101';
const mockCourseRunKey = `${mockCourseKey}+v1`;

const mockAddToast = jest.fn();
const mockRefreshSubsidyRequests = jest.fn();
const initialToastsState = {
  toasts: [],
  addToast: mockAddToast,
  removeToast: jest.fn(),
};

const mockSubsidyRequestConfiguration = {
  subsidyRequestsEnabled: true,
  enterpriseCustomerUuid: mockEnterpriseCustomer.uuid,
  subsidyType: SUBSIDY_TYPE.COUPON,
};
const mockCourseMetadata = {
  key: mockCourseKey,
  courseRunKeys: [mockCourseRunKey],
};

const initialSubsidyRequestsState = {
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
  refreshSubsidyRequests: mockRefreshSubsidyRequests,
  catalogsForSubsidyRequests: [],
};

const TEST_CATALOG_UUID = 'test-catalog-uuid';

const SubsidyRequestButtonWrapper = () => (
  <IntlProvider locale="en">
    <ToastsContext.Provider value={initialToastsState}>
      <SubsidyRequestButton />
    </ToastsContext.Provider>
  </IntlProvider>
);

describe('<SubsidyRequestButton />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useBrowseAndRequestConfiguration.mockReturnValue({ data: mockSubsidyRequestConfiguration });
    useUserSubsidyApplicableToCourse.mockReturnValue({ userSubsidyApplicableToCourse: undefined });
    useCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
    useEnterpriseCourseEnrollments.mockReturnValue({ data: { enterpriseCourseEnrollments: [] } });
    useBrowseAndRequestCatalogsApplicableToCourse.mockReturnValue([TEST_CATALOG_UUID]);
    useUserHasSubsidyRequestForCourse.mockReturnValue(false);
  });

  it('should render button', () => {
    render(<SubsidyRequestButtonWrapper />);
    expect(screen.getByText('Request enrollment'));
  });

  it('should not render button if subsidy requests is not enabled', () => {
    useBrowseAndRequestConfiguration.mockReturnValue({
      data: {
        ...mockSubsidyRequestConfiguration,
        subsidyRequestsEnabled: false,
      },
    });
    render(<SubsidyRequestButtonWrapper />);
    expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
  });

  it('should not render button if course is not applicable to catalogs for configured subsidy request type', () => {
    useBrowseAndRequestCatalogsApplicableToCourse.mockReturnValue([]);
    render(<SubsidyRequestButtonWrapper />);
    expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
  });

  it('should not render button if the user is already enrolled in the course', () => {
    useEnterpriseCourseEnrollments.mockReturnValue({
      data: {
        enterpriseCourseEnrollments: [{
          isEnrollmentActive: true,
          isRevoked: false,
          courseRunId: mockCourseRunKey,
        }],
      },
    });
    render(<SubsidyRequestButtonWrapper />);
    expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
  });

  it('should not render button if the user has an applicable subsidy', () => {
    useUserSubsidyApplicableToCourse.mockReturnValue({ userSubsidyApplicableToCourse: { discount: 100 } });
    render(<SubsidyRequestButtonWrapper />);
    expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
  });

  it('should render button if the user has an applicable subsidy BUT also a subsidy request for the course', () => {
    useUserSubsidyApplicableToCourse.mockReturnValue({ userSubsidyApplicableToCourse: { discount: 100 } });
    useUserHasSubsidyRequestForCourse.mockReturnValue(true);
    render(
      <SubsidyRequestButtonWrapper
        subsidyRequestsState={{
          ...initialSubsidyRequestsState,
          requestsBySubsidyType: {
            [SUBSIDY_TYPE.COUPON]: [{
              status: SUBSIDY_REQUEST_STATE.REQUESTED,
              courseId: mockCourseKey,
            }],
          },
        }}
      />,
    );
    expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
    expect(screen.getByText('Awaiting approval')).toBeInTheDocument();
  });

  it.each([
    {
      subsidyType: SUBSIDY_TYPE.LICENSE,
      expectedCalledFn: entepriseAccessService.postLicenseRequest,
    },
    {
      subsidyType: SUBSIDY_TYPE.COUPON,
      expectedCalledFn: entepriseAccessService.postCouponCodeRequest,
    },
  ])('should call enterprise access to create a subsidy request when clicked', async ({
    subsidyType,
    expectedCalledFn,
  }) => {
    useBrowseAndRequestConfiguration.mockReturnValue({
      data: {
        ...mockSubsidyRequestConfiguration,
        subsidyType,
      },
    });
    render(<SubsidyRequestButtonWrapper />);
    const requestEnrollmentBtn = screen.getByText('Request enrollment');
    userEvent.click(requestEnrollmentBtn);

    await waitFor(() => {
      expect(expectedCalledFn).toHaveBeenCalledWith(mockEnterpriseCustomer.uuid, mockCourseKey);
      expect(mockAddToast).toHaveBeenCalledWith('Request for course submitted');
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    });
    const expectedQueryKey = queryRequestsContextQueryKey(mockEnterpriseCustomer.uuid);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: expectedQueryKey,
    });
  });
});
