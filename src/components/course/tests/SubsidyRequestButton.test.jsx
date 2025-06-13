import { screen, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { ToastsContext } from '../../Toasts/ToastsProvider';
import SubsidyRequestButton from '../SubsidyRequestButton';
import * as entepriseAccessService from '../../enterprise-subsidy-requests/data/service';
import { SUBSIDY_TYPE } from '../../../constants';
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
  useUserHasLearnerCreditRequestForCourse,
} from '../data/hooks';

jest.mock('../../enterprise-subsidy-requests/data/service');

const mockInvalidateQueries = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: mockInvalidateQueries,
  })),
}));

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
  useUserHasLearnerCreditRequestForCourse: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockCourseKey = 'edx+101';
const mockCourseRunKey = `${mockCourseKey}+v1`;
const mockCoursePrice = 0;

const mockAddToast = jest.fn();
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

const TEST_CATALOG_UUID = 'test-catalog-uuid';
const MOCK_POLICY_UUID = 'mock-policy-uuid-123';

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
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: undefined,
      isPending: false,
      canRequestLearnerCredit: false,
      learnerCreditRequestablePolicy: null,
    });
    useCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
    useEnterpriseCourseEnrollments.mockReturnValue({ data: { enterpriseCourseEnrollments: [] } });
    useBrowseAndRequestCatalogsApplicableToCourse.mockReturnValue([TEST_CATALOG_UUID]);
    useUserHasSubsidyRequestForCourse.mockReturnValue(false);
    useUserHasLearnerCreditRequestForCourse.mockReturnValue(false);
  });

  describe('Button visibility and initial state', () => {
    it('should render "Request enrollment" button for legacy B&R by default', () => {
      render(<SubsidyRequestButtonWrapper />);
      expect(screen.getByText('Request enrollment')).toBeInTheDocument();
    });

    it('should not render button if legacy subsidy requests are not enabled and LCR cannot be requested', () => {
      useBrowseAndRequestConfiguration.mockReturnValue({
        data: {
          ...mockSubsidyRequestConfiguration,
          subsidyRequestsEnabled: false,
        },
      });
      useUserSubsidyApplicableToCourse.mockReturnValue({ // Ensure LCR conditions are also not met
        userSubsidyApplicableToCourse: undefined,
        isPending: false,
        canRequestLearnerCredit: false,
        learnerCreditRequestablePolicy: null,
      });
      render(<SubsidyRequestButtonWrapper />);
      expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
      expect(screen.queryByText('Awaiting approval')).not.toBeInTheDocument();
    });

    it('should not render button if course is not applicable to catalogs for configured legacy subsidy request type and LCR cannot be requested', () => {
      useBrowseAndRequestCatalogsApplicableToCourse.mockReturnValue([]);
      useUserSubsidyApplicableToCourse.mockReturnValue({ // Ensure LCR conditions are also not met
        userSubsidyApplicableToCourse: undefined,
        isPending: false,
        canRequestLearnerCredit: false,
        learnerCreditRequestablePolicy: null,
      });
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

    it('should not render button if the user has an applicable subsidy (and no existing requests)', () => {
      useUserSubsidyApplicableToCourse.mockReturnValue({
        userSubsidyApplicableToCourse: { discount: 100 },
        isPending: false,
        canRequestLearnerCredit: false,
        learnerCreditRequestablePolicy: null,
      });
      render(<SubsidyRequestButtonWrapper />);
      expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
    });

    it('should show "Awaiting approval" if userHasSubsidyRequest is true', () => {
      useUserHasSubsidyRequestForCourse.mockReturnValue(true);
      useBrowseAndRequestCatalogsApplicableToCourse.mockReturnValue([]); // Prevent "Request enrollment" for new legacy
      useUserSubsidyApplicableToCourse.mockReturnValue({ // Prevent "Request enrollment" for LCR
        userSubsidyApplicableToCourse: undefined,
        isPending: false,
        canRequestLearnerCredit: false,
        learnerCreditRequestablePolicy: null,
      });
      render(<SubsidyRequestButtonWrapper />);
      expect(screen.getByText('Awaiting approval')).toBeInTheDocument();
      expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
    });

    it('should show "Awaiting approval" if userHasLearnerCreditRequest is true', () => {
      useUserHasLearnerCreditRequestForCourse.mockReturnValue(true);
      useBrowseAndRequestConfiguration.mockReturnValue({ // Disable legacy B&R to isolate LCR
        data: { ...mockSubsidyRequestConfiguration, subsidyRequestsEnabled: false },
      });
      useUserSubsidyApplicableToCourse.mockReturnValue({ // Prevent "Request enrollment" for LCR
        userSubsidyApplicableToCourse: undefined,
        isPending: false,
        canRequestLearnerCredit: false, // Even if true, existing request takes precedence for "Awaiting approval"
        learnerCreditRequestablePolicy: { uuid: MOCK_POLICY_UUID },
      });
      render(<SubsidyRequestButtonWrapper />);
      expect(screen.getByText('Awaiting approval')).toBeInTheDocument();
      expect(screen.queryByText('Request enrollment')).not.toBeInTheDocument();
    });

    it('should show "Request enrollment" for LCR if conditions are met', () => {
      useBrowseAndRequestConfiguration.mockReturnValue({ // Disable legacy B&R
        data: { ...mockSubsidyRequestConfiguration, subsidyRequestsEnabled: false },
      });
      useUserSubsidyApplicableToCourse.mockReturnValue({
        userSubsidyApplicableToCourse: undefined,
        isPending: false,
        canRequestLearnerCredit: true,
        learnerCreditRequestablePolicy: { uuid: MOCK_POLICY_UUID },
      });
      // Defaults: not enrolled, no existing LCR, no existing legacy B&R request
      render(<SubsidyRequestButtonWrapper />);
      expect(screen.getByText('Request enrollment')).toBeInTheDocument();
    });

    it('should not render if no conditions to show any button or existing request are met', () => {
      useBrowseAndRequestConfiguration.mockReturnValue({
        data: {
          ...mockSubsidyRequestConfiguration,
          subsidyRequestsEnabled: false,
        },
      });
      useUserHasSubsidyRequestForCourse.mockReturnValue(false);
      useUserHasLearnerCreditRequestForCourse.mockReturnValue(false);
      useUserSubsidyApplicableToCourse.mockReturnValue({
        userSubsidyApplicableToCourse: undefined,
        isPending: false,
        canRequestLearnerCredit: false,
        learnerCreditRequestablePolicy: null,
      });
      useEnterpriseCourseEnrollments.mockReturnValue({ data: { enterpriseCourseEnrollments: [] } });
      useBrowseAndRequestCatalogsApplicableToCourse.mockReturnValue([]);

      const { container } = render(<SubsidyRequestButtonWrapper />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Button click actions', () => {
    it.each([
      {
        subsidyType: SUBSIDY_TYPE.LICENSE,
        expectedCalledFn: entepriseAccessService.postLicenseRequest,
      },
      {
        subsidyType: SUBSIDY_TYPE.COUPON,
        expectedCalledFn: entepriseAccessService.postCouponCodeRequest,
      },
    ])('should call enterprise access to create a $subsidyType request when clicked', async ({
      subsidyType,
      expectedCalledFn,
    }) => {
      const user = userEvent.setup();
      useBrowseAndRequestConfiguration.mockReturnValue({
        data: {
          ...mockSubsidyRequestConfiguration,
          subsidyRequestsEnabled: true,
          subsidyType,
        },
      });
      // Ensure LCR button conditions are not met
      useUserSubsidyApplicableToCourse.mockReturnValue({
        userSubsidyApplicableToCourse: undefined,
        isPending: false,
        canRequestLearnerCredit: false,
        learnerCreditRequestablePolicy: null,
      });
      // Ensure no existing requests and other conditions for legacy button are met
      useUserHasSubsidyRequestForCourse.mockReturnValue(false);
      useUserHasLearnerCreditRequestForCourse.mockReturnValue(false);
      useBrowseAndRequestCatalogsApplicableToCourse.mockReturnValue([TEST_CATALOG_UUID]);
      useEnterpriseCourseEnrollments.mockReturnValue({ data: { enterpriseCourseEnrollments: [] } });

      render(<SubsidyRequestButtonWrapper />);
      const requestEnrollmentBtn = screen.getByText('Request enrollment');
      await user.click(requestEnrollmentBtn);

      await waitFor(() => {
        expect(expectedCalledFn).toHaveBeenCalledWith(mockEnterpriseCustomer.uuid, mockCourseKey);
        expect(mockAddToast).toHaveBeenCalledWith('Request for course submitted');
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      });
      const expectedQueryKey = queryRequestsContextQueryKey(mockEnterpriseCustomer.uuid);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: expectedQueryKey });
    });

    it('should call enterprise access to create a LearnerCreditRequest when LCR conditions are met and clicked', async () => {
      const user = userEvent.setup();
      useBrowseAndRequestConfiguration.mockReturnValue({ // Disable legacy B&R
        data: { ...mockSubsidyRequestConfiguration, subsidyRequestsEnabled: false },
      });
      useUserSubsidyApplicableToCourse.mockReturnValue({
        userSubsidyApplicableToCourse: undefined,
        isPending: false,
        canRequestLearnerCredit: true,
        learnerCreditRequestablePolicy: { uuid: MOCK_POLICY_UUID },
      });
      // Ensure no existing requests and other conditions for LCR button are met
      useUserHasSubsidyRequestForCourse.mockReturnValue(false);
      useUserHasLearnerCreditRequestForCourse.mockReturnValue(false);
      useEnterpriseCourseEnrollments.mockReturnValue({ data: { enterpriseCourseEnrollments: [] } });

      render(<SubsidyRequestButtonWrapper />);
      const requestEnrollmentBtn = screen.getByText('Request enrollment');
      await user.click(requestEnrollmentBtn);

      await waitFor(() => {
        expect(entepriseAccessService.postLearnerCreditRequest).toHaveBeenCalledWith(
          mockEnterpriseCustomer.uuid,
          MOCK_POLICY_UUID,
          mockCourseKey,
          mockCoursePrice,
        );
        expect(mockAddToast).toHaveBeenCalledWith('Request for course submitted');
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      });
      const expectedQueryKey = queryRequestsContextQueryKey(mockEnterpriseCustomer.uuid);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: expectedQueryKey });
    });

    it('should not make a new legacy request if one already exists and button shows "Awaiting approval"', async () => {
      const user = userEvent.setup();
      useBrowseAndRequestConfiguration.mockReturnValue({
        data: {
          ...mockSubsidyRequestConfiguration,
          subsidyRequestsEnabled: true, // Legacy B&R enabled
          subsidyType: SUBSIDY_TYPE.COUPON,
        },
      });
      useUserHasSubsidyRequestForCourse.mockReturnValue(true); // Existing legacy request

      render(<SubsidyRequestButtonWrapper />);
      const awaitingApprovalBtn = screen.getByText('Awaiting approval');

      await user.click(awaitingApprovalBtn);

      // Verify no service calls are made
      expect(entepriseAccessService.postCouponCodeRequest).not.toHaveBeenCalled();
      expect(entepriseAccessService.postLicenseRequest).not.toHaveBeenCalled();
      expect(entepriseAccessService.postLearnerCreditRequest).not.toHaveBeenCalled();
      expect(mockAddToast).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });
});
