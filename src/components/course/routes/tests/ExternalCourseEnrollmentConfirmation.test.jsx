import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ExternalCourseEnrollmentConfirmation from '../ExternalCourseEnrollmentConfirmation';
import { CourseContext } from '../../CourseContextProvider';
import { DISABLED_ENROLL_REASON_TYPES, LEARNER_CREDIT_SUBSIDY_TYPE } from '../../data/constants';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';
import { emptyRedeemableLearnerCreditPolicies, useEnterpriseCustomer } from '../../../app/data';
import { enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';

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
    organization: {
      logoImgUrl: 'https://test.org/logo.png',
      name: 'Test Org',
      marketingUrl: 'https://test.org',
    },
    title: 'Test Course Title',
    startDate: '2023-03-05',
    duration: '3 Weeks',
    priceDetails: {
      price: 100,
      currency: 'USD',
    },
  }),
}));

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
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

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const baseUserSubsidyContextValue = {
  subscriptionLicense: null,
  couponCodes: {
    couponCodes: [{ discountValue: 90 }],
    couponCodesCount: 0,
  },
  redeemableLearnerCreditPolicies: emptyRedeemableLearnerCreditPolicies,
};

const ExternalCourseEnrollmentConfirmationWrapper = ({
  courseContextValue = baseCourseContextValue,
  initialUserSubsidyState = baseUserSubsidyContextValue,
}) => (
  <IntlProvider locale="en">
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <CourseContext.Provider value={courseContextValue}>
        <ExternalCourseEnrollmentConfirmation />
      </CourseContext.Provider>
    </UserSubsidyContext.Provider>
  </IntlProvider>
);

describe('ExternalCourseEnrollment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  it('renders', () => {
    render(<ExternalCourseEnrollmentConfirmationWrapper />);
    expect(screen.getByText('Congratulations, you have completed your enrollment for your online course')).toBeInTheDocument();
    expect(screen.getByText('Test Course Title')).toBeInTheDocument();
    expect(screen.getByText('Test Org')).toBeInTheDocument();
    expect(screen.getByText('Start date:')).toBeInTheDocument();
    expect(screen.getByText('Mar 5, 2023')).toBeInTheDocument();
    expect(screen.getByText('Course duration:')).toBeInTheDocument();
    expect(screen.getByText('3 Weeks')).toBeInTheDocument();
    expect(screen.getByText('Course total:')).toBeInTheDocument();
    expect(screen.getByText('$100.00 USD')).toBeInTheDocument();
    expect(screen.getByText('$0.00 USD')).toBeInTheDocument();
    expect(screen.getByText('What happens next?')).toBeInTheDocument();
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
    expect(screen.getByText('Mar 5, 2023')).toBeInTheDocument();
    expect(screen.getByText('Course duration:')).toBeInTheDocument();
    expect(screen.getByText('3 Weeks')).toBeInTheDocument();
    expect(screen.getByText('Course total:')).toBeInTheDocument();
    expect(screen.getByText('$100.00 USD')).toBeInTheDocument();
    expect(screen.getByText('What happens next?')).toBeInTheDocument();
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
  });
});
