import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import ExternalCourseEnrollmentConfirmation from '../ExternalCourseEnrollmentConfirmation';
import { CourseContext } from '../../CourseContextProvider';
import { DISABLED_ENROLL_REASON_TYPES, LEARNER_CREDIT_SUBSIDY_TYPE } from '../../data/constants';

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn().mockReturnValue({
    GETSMARTER_LEARNER_DASHBOARD_URL: 'https://test.org/dashboard',
    GETSMARTER_STUDENT_TC_URL: 'https://test.org/terms',
  }),
}));

jest.mock('../../data/hooks', () => ({
  ...jest.requireActual('../../data/hooks'),
  useMinimalCourseMetadata: () => ({
    organizationImage: 'https://test.org/logo.png',
    organizationName: 'Test Org',
    title: 'Test Course Title',
    startDate: 'March 5, 2023',
    duration: '3 Weeks',
    priceDetails: {
      price: 100,
      currency: 'USD',
    },
  }),
}));

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

const appContextValue = {
  enterpriseConfig: {
    name: 'Test Enterprise',
    slug: 'test-enterprise',
    orgId: 'test-enterprise',
    adminUsers: ['edx@example.com'],
  },
};

const ExternalCourseEnrollmentConfirmationWrapper = ({
  courseContextValue = baseCourseContextValue,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={appContextValue}>
      <CourseContext.Provider value={courseContextValue}>
        <ExternalCourseEnrollmentConfirmation />
      </CourseContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('ExternalCourseEnrollment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders', () => {
    render(<ExternalCourseEnrollmentConfirmationWrapper />);
    expect(screen.getByText('Congratulations, you have completed your enrollment for your online course')).toBeInTheDocument();
    expect(screen.getByText('Test Course Title')).toBeInTheDocument();
    expect(screen.getByText('Test Org')).toBeInTheDocument();
    expect(screen.getByText('Start date:')).toBeInTheDocument();
    expect(screen.getByText('March 5, 2023')).toBeInTheDocument();
    expect(screen.getByText('Course duration:')).toBeInTheDocument();
    expect(screen.getByText('3 Weeks')).toBeInTheDocument();
    expect(screen.getByText('Course total:')).toBeInTheDocument();
    expect(screen.getByText('$100.00 USD')).toBeInTheDocument();
    expect(screen.getByText('What happens next?')).toBeInTheDocument();
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
  });

  it('handles failure reason', () => {
    const courseContextValue = {
      ...baseCourseContextValue,
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: { reason: DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS },
    };
    render(<ExternalCourseEnrollmentConfirmationWrapper courseContextValue={courseContextValue} />);
    expect(screen.queryByText('Congratulations, you have completed your enrollment for your online course')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Course Title')).not.toBeInTheDocument();
    expect(screen.getByText("We're sorry.")).toBeInTheDocument();
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText('No learner credit is available to cover this course.'));
  });

  it('handles successful prior redemption', () => {
    const courseContextValue = {
      ...baseCourseContextValue,
      userSubsidyApplicableToCourse: undefined,
      hasSuccessfulRedemption: true,
      missingUserSubsidyReason: { reason: DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS },
    };
    render(<ExternalCourseEnrollmentConfirmationWrapper courseContextValue={courseContextValue} />);
    expect(screen.getByText('Congratulations, you have completed your enrollment for your online course')).toBeInTheDocument();
    expect(screen.getByText('Test Course Title')).toBeInTheDocument();
    expect(screen.getByText('Test Org')).toBeInTheDocument();
    expect(screen.getByText('Start date:')).toBeInTheDocument();
    expect(screen.getByText('March 5, 2023')).toBeInTheDocument();
    expect(screen.getByText('Course duration:')).toBeInTheDocument();
    expect(screen.getByText('3 Weeks')).toBeInTheDocument();
    expect(screen.getByText('Course total:')).toBeInTheDocument();
    expect(screen.getByText('$100.00 USD')).toBeInTheDocument();
    expect(screen.getByText('What happens next?')).toBeInTheDocument();
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
  });
});
