import dayjs from 'dayjs';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import DashboardSidebar from '../DashboardSidebar';
import { renderWithRouter } from '../../../../utils/tests';
import {
  CATALOG_ACCESS_CARD_BUTTON_TEXT,
  CONTACT_HELP_EMAIL_MESSAGE,
  COUPON_CODES_SUMMARY_NOTICE,
  ENTERPRISE_OFFER_SUMMARY_CARD_TITLE,
  LEARNER_CREDIT_ASSIGNMENT_ONLY_SUMMARY,
  LEARNER_CREDIT_CARD_SUMMARY,
  LEARNER_CREDIT_SUMMARY_CARD_TITLE,
  LICENSE_REQUESTED_NOTICE,
  NEED_HELP_BLOCK_TITLE,
  SUBSCRIPTION_SUMMARY_CARD_TITLE,
} from '../data/constants';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import { POLICY_TYPES } from '../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import {
  ASSIGNMENT_TYPES,
  emptyRedeemableLearnerCreditPolicies,
  useAcademies,
  useBrowseAndRequest,
  useCouponCodes,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseOffers,
  useHasAvailableSubsidiesOrRequests,
  useIsAssignmentsOnlyLearner,
  useRedeemablePolicies,
  useSubscriptions,
} from '../../../app/data';
import { SUBSIDY_REQUEST_STATE } from '../../../../constants';
import { academiesFactory, enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn().mockReturnValue({
    LEARNER_SUPPORT_URL: 'https://support.url',
  }),
}));

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
  useSubscriptions: jest.fn(),
  useCouponCodes: jest.fn(),
  useEnterpriseOffers: jest.fn(),
  useRedeemablePolicies: jest.fn(),
  useBrowseAndRequest: jest.fn(),
  useIsAssignmentsOnlyLearner: jest.fn(),
  useHasAvailableSubsidiesOrRequests: jest.fn(),
  useAcademies: jest.fn(),
}));

const mockEnterpriseOffer = {
  isCurrent: true,
  uuid: 'enterprise-offer-id',
  endDatetime: '2021-10-25',
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const mockUseActiveSubsidyOrRequestsData = {
  mockHasAvailableLearnerCreditPolicies: false,
  mockHasAssignedCodesOrCodeRequests: false,
  mockHasActiveLicenseOrLicenseRequest: false,
  mockLearnerCreditSummaryCardData: null,
};
const useMockHasAvailableSubsidyOrRequests = ({
  mockHasAvailableLearnerCreditPolicies,
  mockHasAssignedCodesOrCodeRequests,
  mockHasActiveLicenseOrLicenseRequest,
  mockLearnerCreditSummaryCardData,
}) => ({
  hasAvailableLearnerCreditPolicies: mockHasAvailableLearnerCreditPolicies,
  hasAssignedCodesOrCodeRequests: mockHasAssignedCodesOrCodeRequests,
  learnerCreditSummaryCardData: mockLearnerCreditSummaryCardData,
  hasActiveLicenseOrLicenseRequest: mockHasActiveLicenseOrLicenseRequest,
  hasAvailableSubsidyOrRequests: mockHasAssignedCodesOrCodeRequests
    || mockHasActiveLicenseOrLicenseRequest
    || mockLearnerCreditSummaryCardData,
});

const DashboardSidebarWithContext = () => (
  <IntlProvider locale="en">
    <DashboardSidebar />
  </IntlProvider>
);

describe('<DashboardSidebar />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useEnterpriseCourseEnrollments.mockReturnValue({ data: { allEnrollmentsByStatus: {} } });
    useSubscriptions.mockReturnValue({
      data: {
        subscriptions: {
          subscriptionLicense: undefined,
          subscriptionPlan: undefined,
        },
      },
    });
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [],
        couponCodeRedemptionCount: 0,
      },
    });
    useEnterpriseOffers.mockReturnValue({
      data: {
        enterpriseOffers: [],
        canEnrollWithEnterpriseOffers: false,
      },
    });
    useRedeemablePolicies.mockReturnValue({
      data: {
        redeemablePolicies: [],
      },
    });
    useBrowseAndRequest.mockReturnValue({
      data: {
        requests: {
          couponCodes: [],
          subscriptionLicenses: [],
        },
      },
    });
    useIsAssignmentsOnlyLearner.mockReturnValue(false);
    useHasAvailableSubsidiesOrRequests.mockReturnValue(
      useMockHasAvailableSubsidyOrRequests(mockUseActiveSubsidyOrRequestsData),
    );
    useAcademies.mockReturnValue({ data: academiesFactory(3) });
  });

  test('Coupon codes summary card is displayed when coupon codes are available', () => {
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [{ code: '322DXUX3G2RJXLHF', redemptionsRemaining: 3 }],
        couponCodeRedemptionCount: 3,
      },
    });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(useMockHasAvailableSubsidyOrRequests({
      mockHasAssignedCodesOrCodeRequests: true,
    }));
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.getByText(COUPON_CODES_SUMMARY_NOTICE));
  });
  test('Coupon codes summary card is displayed when there are pending coupon code requests', () => {
    useBrowseAndRequest.mockReturnValue({
      data: {
        requests: {
          couponCodes: [{ state: SUBSIDY_REQUEST_STATE.REQUESTED }],
          subscriptionLicenses: [],
        },
      },
    });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(useMockHasAvailableSubsidyOrRequests({
      mockHasAssignedCodesOrCodeRequests: true,
    }));
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.getByText(COUPON_CODES_SUMMARY_NOTICE));
  });
  test('Coupon codes summary card is not displayed when there are no coupon codes or pending coupon code requests', () => {
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.queryByText(COUPON_CODES_SUMMARY_NOTICE)).toBeFalsy();
  });
  test('Subscription summary card is displayed when subscription is available', () => {
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: { status: LICENSE_STATUS.ACTIVATED },
        subscriptionPlan: {
          daysUntilExpiration: 70,
          expirationDate: dayjs().add(70, 'days').toISOString(),
          isCurrent: true,
        },
        showExpirationNotifications: true,
      },
    });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(useMockHasAvailableSubsidyOrRequests({
      mockHasActiveLicenseOrLicenseRequest: true,
    }));
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.getByText(SUBSCRIPTION_SUMMARY_CARD_TITLE));
  });
  test('Subscription summary card is displayed when there is a pending license request.', () => {
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionPlan: null,
        showExpirationNotifications: true,
      },
    });
    useBrowseAndRequest.mockReturnValue({
      data: {
        requests: {
          couponCodes: [],
          subscriptionLicenses: [{ state: SUBSIDY_REQUEST_STATE.REQUESTED }],
        },
      },
    });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(useMockHasAvailableSubsidyOrRequests({
      mockHasActiveLicenseOrLicenseRequest: true,
    }));
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.getByText(SUBSCRIPTION_SUMMARY_CARD_TITLE));
    expect(screen.getByText(LICENSE_REQUESTED_NOTICE));
  });
  test('Subscription summary card is not displayed when enterprise subscription is not available and there is no pending license request', () => {
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.queryByText(SUBSCRIPTION_SUMMARY_CARD_TITLE)).toBeFalsy();
  });
  test('Enterprise offers summary card is displayed when enterprise has active offers and no subscriptions or coupons or learner credit', () => {
    useEnterpriseOffers.mockReturnValue({
      data: {
        enterpriseOffers: [mockEnterpriseOffer],
        canEnrollWithEnterpriseOffers: true,
      },
    });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(useMockHasAvailableSubsidyOrRequests({
      mockLearnerCreditSummaryCardData: { expirationDate: dayjs().add(70, 'days').toISOString() },
    }));
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.getByText(ENTERPRISE_OFFER_SUMMARY_CARD_TITLE)).toBeInTheDocument();
  });
  test('Enterprise offers summary card is displayed when enterprise has active offers and has subscriptions', () => {
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: { status: LICENSE_STATUS.ACTIVATED },
        subscriptionPlan: {
          daysUntilExpiration: 70,
          expirationDate: dayjs().add(70, 'days').toISOString(),
          isCurrent: true,
        },
        showExpirationNotifications: true,
      },
    });
    useEnterpriseOffers.mockReturnValue({
      data: {
        enterpriseOffers: [mockEnterpriseOffer],
        canEnrollWithEnterpriseOffers: true,
      },
    });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(useMockHasAvailableSubsidyOrRequests({
      mockHasActiveLicenseOrLicenseRequest: true,
      mockLearnerCreditSummaryCardData: { expirationDate: dayjs().add(70, 'days').toISOString() },
    }));
    renderWithRouter(<DashboardSidebarWithContext />);

    expect(screen.queryByText(ENTERPRISE_OFFER_SUMMARY_CARD_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(SUBSCRIPTION_SUMMARY_CARD_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(COUPON_CODES_SUMMARY_NOTICE)).not.toBeInTheDocument();
  });
  test('Enterprise offers summary card is displayed when enterprise has active offers and has coupon codes', () => {
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [{ code: '322DXUX3G2RJXLHF', redemptionsRemaining: 3 }],
        couponCodeRedemptionCount: 3,
      },
    });
    useEnterpriseOffers.mockReturnValue({
      data: {
        enterpriseOffers: [mockEnterpriseOffer],
        canEnrollWithEnterpriseOffers: true,
      },
    });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(useMockHasAvailableSubsidyOrRequests({
      mockHasAssignedCodesOrCodeRequests: true,
      mockLearnerCreditSummaryCardData: { expirationDate: dayjs().add(70, 'days').toISOString() },
    }));
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.queryByText(ENTERPRISE_OFFER_SUMMARY_CARD_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(SUBSCRIPTION_SUMMARY_CARD_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByText(COUPON_CODES_SUMMARY_NOTICE)).toBeInTheDocument();
  });

  test('Learner credit summary card is displayed when enterprise has learner credit', () => {
    useRedeemablePolicies.mockReturnValue({
      data: {
        redeemablePolicies: [{
          uuid: 'policy-uuid',
          subsidyExpirationDate: '2030-01-01 12:00:00Z',
          active: true,
        }],
        learnerContentAssignments: [],
      },
    });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(useMockHasAvailableSubsidyOrRequests({
      mockHasAvailableLearnerCreditPolicies: true,
      mockLearnerCreditSummaryCardData: { expirationDate: dayjs().add(70, 'days').toISOString() },
    }));
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.queryByText(LEARNER_CREDIT_SUMMARY_CARD_TITLE)).toBeInTheDocument();
  });

  test('Only learner credit summary card is displayed when enterprise has both learner credit and offers', () => {
    const policyExpirationDate = '2030-01-01 12:00:00Z';
    const offerEndDate = '2027-10-25';
    useRedeemablePolicies.mockReturnValue({
      data: {
        redeemablePolicies: [{
          uuid: 'policy-uuid',
          subsidyExpirationDate: policyExpirationDate,
          active: true,
        }],
        learnerContentAssignments: [],
      },
    });
    useEnterpriseOffers.mockReturnValue({
      data: {
        enterpriseOffers: [{
          ...mockEnterpriseOffer,
          endDatetime: offerEndDate,
        }],
        canEnrollWithEnterpriseOffers: true,
      },
    });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(useMockHasAvailableSubsidyOrRequests({
      mockHasAvailableLearnerCreditPolicies: true,
      mockLearnerCreditSummaryCardData: { expirationDate: policyExpirationDate },
    }));
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.getByText('2030', { exact: false })).toBeInTheDocument();
    expect(screen.queryByText('2027', { exact: false })).toBeFalsy();
    expect(screen.getByText(LEARNER_CREDIT_CARD_SUMMARY)).toBeInTheDocument();
  });

  test('Only learner credit summary card with contact administrator is displayed when enterprise has assignable policy', () => {
    const policyExpirationDate = '2030-01-01 12:00:00Z';
    useIsAssignmentsOnlyLearner.mockReturnValue(true);
    useRedeemablePolicies.mockReturnValue({
      data: {
        redeemablePolicies: [{
          uuid: 'policy-uuid',
          subsidyExpirationDate: policyExpirationDate,
          active: true,
          policyType: POLICY_TYPES.ASSIGNED_CREDIT,
          learnerContentAssignments: [
            { state: ASSIGNMENT_TYPES.ALLOCATED },
          ],
        }],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
    });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(useMockHasAvailableSubsidyOrRequests({
      mockHasAvailableLearnerCreditPolicies: true,
      mockLearnerCreditSummaryCardData: { expirationDate: dayjs().add(70, 'days').toISOString() },
    }));
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.getByText(LEARNER_CREDIT_ASSIGNMENT_ONLY_SUMMARY)).toBeInTheDocument();
  });
  test('Learner credit summary card with go to academy cta when we have one academy', () => {
    const policyExpirationDate = '2030-01-01 12:00:00Z';
    useIsAssignmentsOnlyLearner.mockReturnValue(false);
    useRedeemablePolicies.mockReturnValue({
      data: {
        redeemablePolicies: [{
          uuid: 'policy-uuid',
          subsidyExpirationDate: policyExpirationDate,
          active: true,
          policyType: POLICY_TYPES.ASSIGNED_CREDIT,
          learnerContentAssignments: [
            { state: ASSIGNMENT_TYPES.ALLOCATED },
          ],
        }],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
    });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(useMockHasAvailableSubsidyOrRequests({
      mockHasAvailableLearnerCreditPolicies: true,
      mockLearnerCreditSummaryCardData: { expirationDate: dayjs().add(70, 'days').toISOString() },
    }));
    useEnterpriseCustomer.mockReturnValue({ data: enterpriseCustomerFactory({ enable_one_academy: true }) });
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.getByText('Go to Academy')).toBeInTheDocument();
  });

  test('Find a course button is not rendered when user has no coupon codes or license subsidy', () => {
    useHasAvailableSubsidiesOrRequests.mockReturnValue(
      useMockHasAvailableSubsidyOrRequests(mockUseActiveSubsidyOrRequestsData),
    );
    renderWithRouter(<DashboardSidebarWithContext />);
    const catalogAccessButton = screen.queryByText(CATALOG_ACCESS_CARD_BUTTON_TEXT);
    expect(catalogAccessButton).toBeFalsy();
  });
  test('Find a course button is not rendered when user has subsidy but customer has search disabled', () => {
    useHasAvailableSubsidiesOrRequests.mockReturnValue(useMockHasAvailableSubsidyOrRequests({
      mockHasActiveLicenseOrLicenseRequest: true,
    }));
    useEnterpriseCustomer.mockReturnValue({ data: enterpriseCustomerFactory({ disable_search: true }) });
    renderWithRouter(<DashboardSidebarWithContext />);
    const catalogAccessButton = screen.queryByText(CATALOG_ACCESS_CARD_BUTTON_TEXT);
    expect(catalogAccessButton).toBeFalsy();
  });

  test('Need help sidebar block is always rendered', () => {
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.queryByText(NEED_HELP_BLOCK_TITLE)).toBeTruthy();
    expect(screen.queryByText(CONTACT_HELP_EMAIL_MESSAGE)).toBeTruthy();
  });
  test('Uses contact email first', () => {
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.getByText('contact your organization\'s edX administrator').closest('a')).toHaveAttribute('href', `mailto:${mockEnterpriseCustomer.contactEmail}`);
  });
  test('Falls back on admin emails if contact email is null', () => {
    useEnterpriseCustomer.mockReturnValue({ data: { ...mockEnterpriseCustomer, contactEmail: null } });
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.getByText('contact your organization\'s edX administrator').closest('a')).toHaveAttribute('href', `mailto:${mockEnterpriseCustomer.adminUsers.map(u => u.email)}`);
  });
  test.each([
    // Only find a course visible
    {
      useHasAvailableSubsidiesOrRequestsValues: {
        mockHasActiveLicenseOrLicenseRequest: true,
        mockHasAvailableLearnerCreditPolicies: true,
        mockHasAssignedCodesOrCodeRequests: true,
        mockLearnerCreditSummaryCardData: { expirationDate: dayjs().subtract(10, 'days').toISOString() },
      },
      disableExpiryMessagingForLearnerCredit: true,
      showExpirationNotifications: false,
      subscriptionPlanMetadata: {
        daysUntilExpiration: -10,
        expirationDate: dayjs().subtract(10, 'days').toISOString(),
        isCurrent: false,
      },
    },
    // both disable expiration flags enabled, dates are expired
    {
      useHasAvailableSubsidiesOrRequestsValues: {
        mockHasActiveLicenseOrLicenseRequest: true,
        mockHasAvailableLearnerCreditPolicies: true,
        mockHasAssignedCodesOrCodeRequests: false,
        mockLearnerCreditSummaryCardData: { expirationDate: dayjs().subtract(10, 'days').toISOString() },
      },
      disableExpiryMessagingForLearnerCredit: true,
      showExpirationNotifications: false,
      subscriptionPlanMetadata: {
        daysUntilExpiration: -10,
        expirationDate: dayjs().subtract(10, 'days').toISOString(),
        isCurrent: false,
      },
    },
    // learner credit disable expiration flags enabled, dates are expired
    {
      useHasAvailableSubsidiesOrRequestsValues: {
        mockHasActiveLicenseOrLicenseRequest: true,
        mockHasAvailableLearnerCreditPolicies: true,
        mockHasAssignedCodesOrCodeRequests: false,
        mockLearnerCreditSummaryCardData: { expirationDate: dayjs().subtract(10, 'days').toISOString() },
      },
      disableExpiryMessagingForLearnerCredit: true,
      showExpirationNotifications: true,
      subscriptionPlanMetadata: {
        daysUntilExpiration: -10,
        expirationDate: dayjs().subtract(10, 'days').toISOString(),
        isCurrent: false,
      },
    },
    // subscription disable expiration flag enabled, dates are expired
    {
      useHasAvailableSubsidiesOrRequestsValues: {
        mockHasActiveLicenseOrLicenseRequest: true,
        mockHasAvailableLearnerCreditPolicies: true,
        mockHasAssignedCodesOrCodeRequests: false,
        mockLearnerCreditSummaryCardData: { expirationDate: dayjs().subtract(10, 'days').toISOString() },
      },
      disableExpiryMessagingForLearnerCredit: false,
      showExpirationNotifications: false,
      subscriptionPlanMetadata: {
        daysUntilExpiration: -10,
        expirationDate: dayjs().subtract(10, 'days').toISOString(),
        isCurrent: false,
      },
    },
    // active learner credit plan with disabled subscription, dates are expired
    {
      useHasAvailableSubsidiesOrRequestsValues: {
        mockHasActiveLicenseOrLicenseRequest: false,
        mockHasAvailableLearnerCreditPolicies: true,
        mockHasAssignedCodesOrCodeRequests: false,
        mockLearnerCreditSummaryCardData: { expirationDate: dayjs().subtract(10, 'days').toISOString() },
      },
      disableExpiryMessagingForLearnerCredit: true,
      showExpirationNotifications: false,
      subscriptionPlanMetadata: {
        daysUntilExpiration: -10,
        expirationDate: dayjs().subtract(10, 'days').toISOString(),
        isCurrent: false,
      },
    },
    // active subscription with disabled learner credit plan, dates are expired
    {
      useHasAvailableSubsidiesOrRequestsValues: {
        mockHasActiveLicenseOrLicenseRequest: true,
        mockHasAvailableLearnerCreditPolicies: false,
        mockHasAssignedCodesOrCodeRequests: false,
        mockLearnerCreditSummaryCardData: { expirationDate: dayjs().subtract(10, 'days').toISOString() },
      },
      disableExpiryMessagingForLearnerCredit: true,
      showExpirationNotifications: false,
      subscriptionPlanMetadata: {
        daysUntilExpiration: -10,
        expirationDate: dayjs().subtract(10, 'days').toISOString(),
        isCurrent: false,
      },
    },
    // learner credit disable expiration flags enabled, dates are expiring
    {
      useHasAvailableSubsidiesOrRequestsValues: {
        mockHasActiveLicenseOrLicenseRequest: true,
        mockHasAvailableLearnerCreditPolicies: true,
        mockHasAssignedCodesOrCodeRequests: false,
        mockLearnerCreditSummaryCardData: { expirationDate: dayjs().add(10, 'days').toISOString() },
      },
      disableExpiryMessagingForLearnerCredit: true,
      showExpirationNotifications: true,
      subscriptionPlanMetadata: {
        daysUntilExpiration: 10,
        expirationDate: dayjs().add(10, 'days').toISOString(),
        isCurrent: false,
      },
    },
    // subscription disable expiration flag enabled, dates are expiring
    {
      useHasAvailableSubsidiesOrRequestsValues: {
        mockHasActiveLicenseOrLicenseRequest: true,
        mockHasAvailableLearnerCreditPolicies: true,
        mockHasAssignedCodesOrCodeRequests: false,
        mockLearnerCreditSummaryCardData: { expirationDate: dayjs().add(10, 'days').toISOString() },
      },
      disableExpiryMessagingForLearnerCredit: false,
      showExpirationNotifications: false,
      subscriptionPlanMetadata: {
        daysUntilExpiration: 10,
        expirationDate: dayjs().add(10, 'days').toISOString(),
        isCurrent: false,
      },
    },
    // active learner credit plan with disabled subscription, dates are expiring
    {
      useHasAvailableSubsidiesOrRequestsValues: {
        mockHasActiveLicenseOrLicenseRequest: false,
        mockHasAvailableLearnerCreditPolicies: true,
        mockHasAssignedCodesOrCodeRequests: false,
        mockLearnerCreditSummaryCardData: { expirationDate: dayjs().add(10, 'days').toISOString() },
      },
      disableExpiryMessagingForLearnerCredit: true,
      showExpirationNotifications: false,
      subscriptionPlanMetadata: {
        daysUntilExpiration: 10,
        expirationDate: dayjs().add(10, 'days').toISOString(),
        isCurrent: false,
      },
    },
    // active subscription with disabled learner credit plan, dates are expiring
    {
      useHasAvailableSubsidiesOrRequestsValues: {
        mockHasActiveLicenseOrLicenseRequest: true,
        mockHasAvailableLearnerCreditPolicies: false,
        mockHasAssignedCodesOrCodeRequests: false,
        mockLearnerCreditSummaryCardData: { expirationDate: dayjs().add(10, 'days').toISOString() },
      },
      disableExpiryMessagingForLearnerCredit: true,
      showExpirationNotifications: false,
      subscriptionPlanMetadata: {
        daysUntilExpiration: 10,
        expirationDate: dayjs().add(10, 'days').toISOString(),
        isCurrent: false,
      },
    },
  ])('Date is or is not rendered when expiration flags for subscriptions and learner credit are enabled (%s)', ({
    useHasAvailableSubsidiesOrRequestsValues,
    disableExpiryMessagingForLearnerCredit,
    showExpirationNotifications,
    subscriptionPlanMetadata,
  }) => {
    useHasAvailableSubsidiesOrRequests.mockReturnValue(useMockHasAvailableSubsidyOrRequests({
      ...useHasAvailableSubsidiesOrRequestsValues,
    }));
    useEnterpriseCustomer.mockReturnValue({
      data: enterpriseCustomerFactory({
        disable_expiry_messaging_for_learner_credit: disableExpiryMessagingForLearnerCredit,
      }),
    });
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: { status: LICENSE_STATUS.ACTIVATED },
        subscriptionPlan: subscriptionPlanMetadata,
        showExpirationNotifications,
      },
    });
    const {
      mockHasAvailableLearnerCreditPolicies,
      mockHasActiveLicenseOrLicenseRequest,
    } = useHasAvailableSubsidiesOrRequestsValues;
    renderWithRouter(<DashboardSidebarWithContext />);
    const catalogAccessButton = screen.queryByText(CATALOG_ACCESS_CARD_BUTTON_TEXT);
    expect(catalogAccessButton).toBeTruthy();
    const expiredLearnerCreditText = screen.queryByTestId('learner-credit-summary-end-date-text');
    const expiredSubscriptionText = screen.queryByTestId('subscription-summary-end-date-text');
    if (mockHasAvailableLearnerCreditPolicies && !disableExpiryMessagingForLearnerCredit) {
      expect(expiredLearnerCreditText).toBeTruthy();
    } else if (mockHasAvailableLearnerCreditPolicies && disableExpiryMessagingForLearnerCredit) {
      expect(expiredLearnerCreditText).toBeFalsy();
    }
    if (mockHasActiveLicenseOrLicenseRequest && showExpirationNotifications) {
      expect(expiredSubscriptionText).toBeTruthy();
    } else if (mockHasActiveLicenseOrLicenseRequest && !showExpirationNotifications) {
      expect(expiredSubscriptionText).toBeFalsy();
    }
  });
});
