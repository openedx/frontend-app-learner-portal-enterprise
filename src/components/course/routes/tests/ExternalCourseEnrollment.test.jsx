import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import UserEnrollmentForm from '../../../executive-education-2u/UserEnrollmentForm';
import ExternalCourseEnrollment from '../ExternalCourseEnrollment';
import { CourseContext } from '../../CourseContextProvider';
import { CourseEnrollmentsContext } from '../../../dashboard/main-content/course-enrollments/CourseEnrollmentsContextProvider';
import { DISABLED_ENROLL_REASON_TYPES, LEARNER_CREDIT_SUBSIDY_TYPE } from '../../data/constants';

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

jest.mock('../../data/hooks', () => ({
  ...jest.requireActual('../../data/hooks'),
  useMinimalCourseMetadata: () => ({
    organizationImage: 'https://test.org/logo.png',
    organizationName: 'Test Org',
    title: 'Test Course Title',
    startDate: '2023-03-05',
    duration: '3 Weeks',
    priceDetails: {
      price: 100,
      currency: 'USD',
    },
  }),
}));

jest.mock('../../../executive-education-2u/UserEnrollmentForm', () => jest.fn(() => (
  <div data-testid="user-enrollment-form" />
)));

const baseCourseContextValue = {
  state: {
    courseEntitlementProductSku: 'test-sku',
    activeCourseRun: {
      weeksToComplete: 8,
    },
    course: {
      organizationShortCodeOverride: 'Test Org',
      organizationLogoOverrideUrl: 'https://test.org/logo.png',
    },
  },
  userSubsidyApplicableToCourse: { subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE },
  missingUserSubsidyReason: undefined,
};

const baseAppContextValue = {
  enterpriseConfig: {
    uuid: 'test-uuid',
    enableDataSharingConsent: true,
    adminUsers: ['edx@example.com'],
  },
  authenticatedUser: { id: 3 },
};

const ExternalCourseEnrollmentWrapper = (
  {
    courseContextValue = baseCourseContextValue,
    appContextValue = baseAppContextValue,
  },
  CourseEnrollmentsContextValue = {
    courseEnrollmentsByStatus: {},
  },
) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={appContextValue}>
      <CourseContext.Provider value={courseContextValue}>
        <CourseEnrollmentsContext.Provider value={CourseEnrollmentsContextValue}>
          <ExternalCourseEnrollment />
        </CourseEnrollmentsContext.Provider>
      </CourseContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('ExternalCourseEnrollment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and handles checkout success', () => {
    renderWithRouter(<ExternalCourseEnrollmentWrapper />);
    expect(screen.getByText('Your registration(s)')).toBeInTheDocument();
    expect(screen.getByText('Test Course Title')).toBeInTheDocument();
    expect(screen.getByText('Available start date:')).toBeInTheDocument();
    expect(screen.getByText('Course duration:')).toBeInTheDocument();
    expect(screen.getByText('Course total:')).toBeInTheDocument();
    expect(screen.getAllByText('$100.00 USD')).toHaveLength(2);
    expect(screen.getByText('Registration summary:')).toBeInTheDocument();
    expect(screen.getByText('Registration total:')).toBeInTheDocument();
    expect(screen.getByTestId('user-enrollment-form')).toBeInTheDocument();
    expect(UserEnrollmentForm.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        onCheckoutSuccess: expect.any(Function),
        productSKU: 'test-sku',
      }),
    );
    UserEnrollmentForm.mock.calls[0][0].onCheckoutSuccess();
    expect(mockHistoryPush).toHaveBeenCalledTimes(1);
    expect(mockHistoryPush).toHaveBeenCalledWith('enroll/complete');
  });

  it.each([
    DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS,
    DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.POLICY_NOT_ACTIVE,
    DISABLED_ENROLL_REASON_TYPES.NOT_ENOUGH_VALUE_IN_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_ENROLLMENTS_REACHED,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED,
    DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_NOT_IN_ENTERPRISE,
  ])('handles failure reason (%s)', (failureReason) => {
    const courseContextValue = {
      ...baseCourseContextValue,
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: { reason: failureReason },
    };
    renderWithRouter(<ExternalCourseEnrollmentWrapper courseContextValue={courseContextValue} />);
    expect(screen.queryByText('Your registration(s)')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Course Title')).not.toBeInTheDocument();
    expect(screen.getByText("We're sorry.")).toBeInTheDocument();
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('handles successful prior redemption', () => {
    const courseContextValue = {
      ...baseCourseContextValue,
      userSubsidyApplicableToCourse: undefined,
      hasSuccessfulRedemption: true,
      missingUserSubsidyReason: { reason: DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY },
    };
    renderWithRouter(<ExternalCourseEnrollmentWrapper courseContextValue={courseContextValue} />);
    expect(screen.getByText('Your registration(s)')).toBeInTheDocument();
    expect(screen.getByText('Test Course Title')).toBeInTheDocument();
    expect(screen.getByText('Available start date:')).toBeInTheDocument();
    expect(screen.getByText('Course duration:')).toBeInTheDocument();
    expect(screen.getByText('Course total:')).toBeInTheDocument();
    expect(screen.getAllByText('$100.00 USD')).toHaveLength(2);
    expect(screen.getByText('Registration summary:')).toBeInTheDocument();
    expect(screen.getByText('Registration total:')).toBeInTheDocument();
    expect(screen.getByTestId('user-enrollment-form')).toBeInTheDocument();
  });
});
