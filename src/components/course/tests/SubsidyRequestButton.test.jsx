import React from 'react';
import {
  screen, render, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { ToastsContext } from '../../Toasts/ToastsProvider';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import SubsidyRequestButton from '../SubsidyRequestButton';
import { CourseContext } from '../CourseContextProvider';
import * as entepriseAccessService from '../../enterprise-subsidy-requests/data/service';
import { SUBSIDY_REQUEST_STATE, SUBSIDY_TYPE } from '../../../constants';

jest.mock('../../enterprise-subsidy-requests/data/service');

const mockEnterpriseUUID = 'uuid';
const mockCourseKey = 'edx+101';
const mockCourseRunKey = `${mockCourseKey}+v1`;

const mockAddToast = jest.fn();
const mockRefreshSubsidyRequests = jest.fn();
const initialToastsState = {
  toasts: [],
  addToast: mockAddToast,
  removeToast: jest.fn(),
};

const initialSubsidyRequestsState = {
  subsidyRequestConfiguration: {
    subsidyRequestsEnabled: true,
    enterpriseCustomerUuid: mockEnterpriseUUID,
    subsidyType: SUBSIDY_TYPE.COUPON,
  },
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
  refreshSubsidyRequests: mockRefreshSubsidyRequests,
  catalogsForSubsidyRequests: [],
};

const TEST_CATALOG_UUID = 'test-catalog-uuid';
const courseState = {
  course: {
    key: mockCourseKey,
    courseRunKeys: [mockCourseRunKey],
  },
  catalog: { containsContentItems: true, catalogList: [TEST_CATALOG_UUID] },
  userEnrollments: [],
};

const defaultCourseContextValue = {
  state: courseState,
  userSubsidyApplicableToCourse: undefined,
  subsidyRequestCatalogsApplicableToCourse: new Set([TEST_CATALOG_UUID]),
};

const SubsidyRequestButtonWrapper = ({
  subsidyRequestsState = {},
  courseContextValue = defaultCourseContextValue,
}) => (
  <ToastsContext.Provider value={initialToastsState}>
    <SubsidyRequestsContext.Provider value={{ ...initialSubsidyRequestsState, ...subsidyRequestsState }}>
      <CourseContext.Provider value={{ state: courseState, ...courseContextValue }}>
        <SubsidyRequestButton />
      </CourseContext.Provider>
    </SubsidyRequestsContext.Provider>
  </ToastsContext.Provider>
);

describe('<SubsidyRequestButton />', () => {
  afterEach(() => jest.clearAllMocks());

  it('should render button', () => {
    render(<SubsidyRequestButtonWrapper />);
    expect(screen.getByText('Request enrollment'));
  });

  it('should not render button if subsidy requests is not enabled', () => {
    render(
      <SubsidyRequestButtonWrapper
        subsidyRequestsState={{
          ...initialSubsidyRequestsState,
          subsidyRequestConfiguration: {
            subsidyRequestsEnabled: false,
          },
        }}
      />,
    );
    expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
  });

  it('should not render button if course is not applicable to catalogs for configured subsidy request type', () => {
    render(
      <SubsidyRequestButtonWrapper
        courseContextValue={{
          ...defaultCourseContextValue,
          subsidyRequestCatalogsApplicableToCourse: new Set(),
        }}
      />,
    );
    expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
  });

  it('should not render button if the user is already enrolled in the course', () => {
    render(
      <SubsidyRequestButtonWrapper
        courseContextValue={{
          ...defaultCourseContextValue,
          state: {
            ...defaultCourseContextValue.state,
            userEnrollments: [
              {
                isEnrollmentActive: true,
                isRevoked: false,
                courseRunId: mockCourseRunKey,
              },
            ],
          },
        }}
      />,
    );
    expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
  });

  it('should not render button if the user has an applicable subsidy', () => {
    render(
      <SubsidyRequestButtonWrapper
        courseContextValue={{
          ...defaultCourseContextValue,
          userSubsidyApplicableToCourse: {
            discount: 100,
          },
        }}
      />,
    );
    expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
  });

  it('should render button if the user has an applicable subsidy BUT also a subsidy request for the course', () => {
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
        contextContextValue={{
          ...defaultCourseContextValue,
          userSubsidyApplicableToCourse: {
            discount: 100,
          },
        }}
      />,
    );
    expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
    expect(screen.getByText('Awaiting approval')).toBeInTheDocument();
  });

  it.each(
    [{
      subsidyType: SUBSIDY_TYPE.LICENSE,
      expectedCalledFn: entepriseAccessService.postLicenseRequest,
    },
    {
      subsidyType: SUBSIDY_TYPE.COUPON,
      expectedCalledFn: entepriseAccessService.postCouponCodeRequest,
    },
    ],
  )('should call enterprise access to create a subsidy request when clicked', async (
    {
      subsidyType, expectedCalledFn,
    },
  ) => {
    render(
      <SubsidyRequestButtonWrapper
        subsidyRequestsState={{
          ...initialSubsidyRequestsState,
          subsidyRequestConfiguration: {
            ...initialSubsidyRequestsState.subsidyRequestConfiguration,
            subsidyType,
          },
        }}
      />,
    );
    const requestEnrollmentBtn = screen.getByText('Request enrollment');
    userEvent.click(requestEnrollmentBtn);

    await waitFor(() => {
      expect(
        expectedCalledFn,
      ).toHaveBeenCalledWith(mockEnterpriseUUID, mockCourseKey);
      expect(mockAddToast).toHaveBeenCalledWith('Request for course submitted');
      expect(mockRefreshSubsidyRequests).toHaveBeenCalled();
    });
  });
});
