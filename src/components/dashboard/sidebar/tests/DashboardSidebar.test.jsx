import React from 'react';
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
import { ASSIGNMENT_TYPES, POLICY_TYPES } from '../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import {
  emptyRedeemableLearnerCreditPolicies,
  useBrowseAndRequest,
  useCouponCodes,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseOffers,
  useIsAssignmentsOnlyLearner,
  useRedeemablePolicies,
  useSubscriptions,
} from '../../../app/data';
import { SUBSIDY_REQUEST_STATE } from '../../../../constants';
import { enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';

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
}));

const mockEnterpriseOffer = {
  isCurrent: true,
  uuid: 'enterprise-offer-id',
  endDatetime: '2021-10-25',
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

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
  });

  test('Coupon codes summary card is displayed when coupon codes are available', () => {
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [{ id: 3 }],
      },
    });
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
        },
      },
    });
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.getByText(SUBSCRIPTION_SUMMARY_CARD_TITLE));
  });
  test('Subscription summary card is displayed when there is a pending license request.', () => {
    useBrowseAndRequest.mockReturnValue({
      data: {
        requests: {
          couponCodes: [],
          subscriptionLicenses: [{ state: SUBSIDY_REQUEST_STATE.REQUESTED }],
        },
      },
    });
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
        },
      },
    });
    useEnterpriseOffers.mockReturnValue({
      data: {
        enterpriseOffers: [mockEnterpriseOffer],
        canEnrollWithEnterpriseOffers: true,
      },
    });
    renderWithRouter(<DashboardSidebarWithContext />);

    expect(screen.queryByText(ENTERPRISE_OFFER_SUMMARY_CARD_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(SUBSCRIPTION_SUMMARY_CARD_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(COUPON_CODES_SUMMARY_NOTICE)).not.toBeInTheDocument();
  });
  test('Enterprise offers summary card is displayed when enterprise has active offers and has coupon codes', () => {
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [{ id: 3 }],
      },
    });
    useEnterpriseOffers.mockReturnValue({
      data: {
        enterpriseOffers: [mockEnterpriseOffer],
        canEnrollWithEnterpriseOffers: true,
      },
    });
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
    renderWithRouter(<DashboardSidebarWithContext />);
    expect(screen.getByText(LEARNER_CREDIT_ASSIGNMENT_ONLY_SUMMARY)).toBeInTheDocument();
  });

  test('Find a course button is not rendered when user has no coupon codes or license subsidy', () => {
    renderWithRouter(<DashboardSidebarWithContext />);
    const catalogAccessButton = screen.queryByText(CATALOG_ACCESS_CARD_BUTTON_TEXT);
    expect(catalogAccessButton).toBeFalsy();
  });
  test('Find a course button is not rendered when user has subsidy but customer has search disabled', () => {
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
});
