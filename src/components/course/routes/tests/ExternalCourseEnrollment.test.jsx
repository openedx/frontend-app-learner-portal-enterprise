import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
// TODO: legacy import for skipped tests.
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouterProvider } from '../../../../utils/tests';

import { DISABLED_ENROLL_REASON_TYPES } from '../../data/constants';
import ExternalCourseEnrollment from '../ExternalCourseEnrollment';
import { CourseContext } from '../../CourseContextProvider';
import {
  useCourseRedemptionEligibility,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
} from '../../../app/data';
import { enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';
import {
  useExternalEnrollmentFailureReason,
  useIsCourseAssigned,
  useMinimalCourseMetadata,
} from '../../data/hooks';

const mockCourseKey = 'bin+bar';
const mockCourseRunKey = `course-v1:${mockCourseKey}+baz`;

const defaultExternalEnrollmentFailureReason = {
  failureReason: undefined,
  failureMessage: undefined,
};

// The UserEnrollmmentForm can be tested separately.
jest.mock('../../../executive-education-2u/UserEnrollmentForm', () => jest.fn(() => (
  <div data-testid="user-enrollment-form" />
)));

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => ({
    GETSMARTER_LEARNER_DASHBOARD_URL: 'https://getsmarter.example.com/account',
  })),
}));

// TODO: remove unused mock still needed for skipped tests.
const mockNavigate = jest.fn();

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useCourseRedemptionEligibility: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('../../data/hooks', () => ({
  ...jest.requireActual('../../data/hooks'),
  useExternalEnrollmentFailureReason: jest.fn(),
  useIsCourseAssigned: jest.fn(),
  useMinimalCourseMetadata: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const baseCourseContextValue = {};

const ExternalCourseEnrollmentWrapper = ({
  courseContextValue = baseCourseContextValue,
}) => (
  <IntlProvider locale="en">
    <CourseContext.Provider value={courseContextValue}>
      <ExternalCourseEnrollment />
    </CourseContext.Provider>
  </IntlProvider>
);

describe('ExternalCourseEnrollment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    // Mock having NO existing enrollment.
    // If there was an enrollment, we should have redirected before rendering this route anyway.
    useEnterpriseCourseEnrollments.mockReturnValue({
      data: {
        enterpriseCourseEnrollments: [],
        allEnrollmentsByStatus: {
          inProgress: [],
          upcoming: [],
          completed: [],
          savedForLater: [],
          requested: [],
          assigned: [],
        },
      },
    });
    useExternalEnrollmentFailureReason.mockReturnValue(defaultExternalEnrollmentFailureReason);
    useMinimalCourseMetadata.mockReturnValue({
      data: {
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
      },
    });
    // Mock the hook that is primarily responsible for calling the policy can_redeem endpoint.
    useCourseRedemptionEligibility.mockReturnValue({
      data: {
        isPolicyRedemptionEnabled: true,
        listPrice: 10000, // can_redeem returns the course price, even though course metadata already does too.
      },
    });
    // The course is NOT assigned using top-down learner credit assignments.
    useIsCourseAssigned.mockReturnValue(false);
  });

  it('renders and handles checkout success', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey/enroll/:courseRunKey',
      element: <ExternalCourseEnrollmentWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseKey}/enroll/${mockCourseRunKey}`],
    });
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

  it.each([
    'no_offer_available',
    'no_offer_with_enough_balance',
    'no_offer_with_remaining_applications',
    'no_offer_with_enough_user_balance',
    'system_error',
  ])('handles failure reason (%s)', (failureReason) => {
    useExternalEnrollmentFailureReason.mockReturnValue({
      failureReason,
      failureMessage: 'Mock message',
    });
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey/enroll/:courseRunKey',
      element: <ExternalCourseEnrollmentWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseKey}/enroll/${mockCourseRunKey}`],
    });
    expect(screen.queryByText('Your registration(s)')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Course Title')).not.toBeInTheDocument();
    expect(screen.getByText("We're sorry.")).toBeInTheDocument();
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText('Mock message')).toBeInTheDocument();
  });

  // SKIPPED TEST.
  // TODO: [TROY] I assume this should be moved to externalCourseEnrollmentLoader.test.jsx
  it.skip('handles successful prior redemption', () => {
    const courseContextValue = {
      ...baseCourseContextValue,
      userSubsidyApplicableToCourse: undefined,
      redeemabilityPerContentKey: [
        {
          contentKey: mockCourseRunKey,
          hasSuccessfulRedemption: true,
        },
      ],
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

  // SKIPPED TEST.
  // TODO: [TROY] I assume this should be moved to externalCourseEnrollmentLoader.test.jsx
  it.skip('handles a courserun that has already been enrolled', () => {
    const courseContextValue = {
      ...baseCourseContextValue,
      redeemabilityPerContentKey: [
        {
          contentKey: mockCourseRunKey,
          hasSuccessfulRedemption: true,
        },
      ],
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
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey/enroll/:courseRunKey',
      element: <ExternalCourseEnrollmentWrapper courseContextValue={courseContextValue} />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseKey}/enroll/${mockCourseRunKey}`],
    });
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
