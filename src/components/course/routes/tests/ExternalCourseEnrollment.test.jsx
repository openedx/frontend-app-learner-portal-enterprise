import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform';
import { Factory } from 'rosie';

import UserEnrollmentForm from '../../../executive-education-2u/UserEnrollmentForm';
import ExternalCourseEnrollment from '../ExternalCourseEnrollment';
import { CourseContext } from '../../CourseContextProvider';
import { DISABLED_ENROLL_REASON_TYPES, LEARNER_CREDIT_SUBSIDY_TYPE } from '../../data/constants';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';
import { emptyRedeemableLearnerCreditPolicies, useEnterpriseCustomer } from '../../../app/data';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../data/hooks', () => ({
  ...jest.requireActual('../../data/hooks'),
  useMinimalCourseMetadata: () => ({
    organization: {
      name: 'Test Org',
      logoImgUrl: 'https://test.org/logo.png',
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

jest.mock('../../../executive-education-2u/UserEnrollmentForm', () => jest.fn(() => (
  <div data-testid="user-enrollment-form" />
)));

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => ({
    GETSMARTER_LEARNER_DASHBOARD_URL: 'https://getsmarter.example.com/account',
  })),
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

const mockEnterpriseCustomer = camelCaseObject(Factory.build('enterpriseCustomer'));
const mockAuthenticatedUser = camelCaseObject(Factory.build('authenticatedUser'));

const baseAppContextValue = {
  authenticatedUser: mockAuthenticatedUser,
};

const baseUserSubsidyContextValue = {
  redeemableLearnerCreditPolicies: emptyRedeemableLearnerCreditPolicies,
};

const ExternalCourseEnrollmentWrapper = ({
  courseContextValue = baseCourseContextValue,
  appContextValue = baseAppContextValue,
  initialUserSubsidyState = baseUserSubsidyContextValue,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={appContextValue}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <CourseContext.Provider value={courseContextValue}>
          <ExternalCourseEnrollment />
        </CourseContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('ExternalCourseEnrollment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
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
        productSKU: 'test-sku',
      }),
    );
  });

  it.each([
    DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS,
    DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.SUBSIDY_NOT_ACTIVE,
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

  it('handles a courserun that has already been enrolled', () => {
    const courseContextValue = {
      ...baseCourseContextValue,
      hasSuccessfulRedemption: true,
    };
    renderWithRouter(<ExternalCourseEnrollmentWrapper courseContextValue={courseContextValue} />);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it.each([
    { hasDuplicateOrder: true },
    { hasDuplicateOrder: false },
  ])('shows duplicate order alert (%s)', async ({ hasDuplicateOrder }) => {
    const mockScrollIntoView = jest.fn();
    global.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

    const courseContextValue = {
      ...baseCourseContextValue,
      externalCourseFormSubmissionError: hasDuplicateOrder ? { message: 'duplicate order' } : undefined,
    };
    renderWithRouter(<ExternalCourseEnrollmentWrapper courseContextValue={courseContextValue} />);
    if (hasDuplicateOrder) {
      expect(screen.getByText('Already Enrolled')).toBeInTheDocument();
      const dashboardButton = screen.getByText('Go to dashboard');
      expect(dashboardButton).toBeInTheDocument();
      expect(dashboardButton).toHaveAttribute(
        'href',
        `https://getsmarter.example.com/account?org_id=${mockEnterpriseCustomer.authOrgId}`,
      );
      expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
      expect(mockScrollIntoView).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'smooth' }),
      );
    } else {
      expect(screen.queryByText('Already Enrolled')).not.toBeInTheDocument();
      expect(screen.queryByText('Go to dashboard')).not.toBeInTheDocument();
      expect(mockScrollIntoView).toHaveBeenCalledTimes(0);
    }
  });
});
