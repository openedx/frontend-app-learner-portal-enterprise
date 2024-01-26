import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';
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
import { LICENSE_STATUS, emptyRedeemableLearnerCreditPolicies } from '../../../enterprise-user-subsidy/data/constants';
import CourseEnrollmentsContextProvider from '../../main-content/course-enrollments/CourseEnrollmentsContextProvider';
import { SubsidyRequestsContext } from '../../../enterprise-subsidy-requests';
import { SUBSIDY_REQUEST_STATE, SUBSIDY_TYPE } from '../../../enterprise-subsidy-requests/constants';
import { ASSIGNMENT_TYPES, POLICY_TYPES } from '../../../enterprise-user-subsidy/enterprise-offers/data/constants';

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn().mockReturnValue({
    LEARNER_SUPPORT_URL: 'https://support.url',
  }),
}));

const mockEnterpriseOffer = {
  isCurrent: true,
  uuid: 'enterprise-offer-id',
  endDatetime: '2021-10-25',
};

const DashboardSidebarWithContext = ({
  initialAppState = { fakeContext: 'foo' },
  initialUserSubsidyState = {},
  initialSubsidyRequestsState = {
    subsidyRequestConfiguration: {},
    requestsBySubsidyType: {
      [SUBSIDY_TYPE.LICENSE]: [],
      [SUBSIDY_TYPE.COUPON]: [],
    },

  },
  initialCourseEnrollmentsState = {
    courseEnrollmentsByStatus: {},
  },
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
          <CourseEnrollmentsContextProvider value={initialCourseEnrollmentsState}>
            <DashboardSidebar />
          </CourseEnrollmentsContextProvider>
        </SubsidyRequestsContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<DashboardSidebar />', () => {
  const defaultUserSubsidyState = {
    subscriptionPlan: undefined,
    subscriptionLicense: undefined,
    couponCodes: {
      couponCodes: [],
      loading: false,
      couponCodesCount: 0,
    },
    enterpriseOffers: [],
    redeemableLearnerCreditPolicies: undefined,
  };
  const initialAppState = {
    enterpriseConfig: {
      contactEmail: 'foo@foo.com',
      adminUsers: [{ email: 'admin@foo.com' }],
    },
    name: 'Bears Inc.',
  };
  const userSubsidyStateWithSubscription = {
    ...defaultUserSubsidyState,
    subscriptionPlan: {
      daysUntilExpiration: 70,
      expirationDate: '2021-10-25',
    },
    subscriptionLicense: {
      status: LICENSE_STATUS.ACTIVATED,
    },
  };
  test('Coupon codes summary card is displayed when coupon codes are available', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{
          ...defaultUserSubsidyState,
          couponCodes: { ...defaultUserSubsidyState.couponCodes, couponCodesCount: 2 },
        }}
      />,
    );
    expect(screen.getByText(COUPON_CODES_SUMMARY_NOTICE));
  });
  test('Coupon codes summary card is displayed when there are pending coupon code requests', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={defaultUserSubsidyState}
        initialSubsidyRequestsState={{
          requestsBySubsidyType: {
            [SUBSIDY_TYPE.LICENSE]: [],
            [SUBSIDY_TYPE.COUPON]: [
              {
                state: SUBSIDY_REQUEST_STATE.REQUESTED,
              },
            ],
          },
        }}
      />,
    );
    expect(screen.getByText(COUPON_CODES_SUMMARY_NOTICE));
  });
  test('Coupon codes summary card is not displayed when there are no coupon codes or pending coupon code requests', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={defaultUserSubsidyState}
      />,
    );
    expect(screen.queryByText(COUPON_CODES_SUMMARY_NOTICE)).toBeFalsy();
  });
  test('Subscription summary card is displayed when subscription is available', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={userSubsidyStateWithSubscription}
      />,
    );
    expect(screen.getByText(SUBSCRIPTION_SUMMARY_CARD_TITLE));
  });
  test('Subscription summary card is displayed when there is a pending license request.', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={defaultUserSubsidyState}
        initialSubsidyRequestsState={{
          requestsBySubsidyType: {
            [SUBSIDY_TYPE.LICENSE]: [
              {
                state: SUBSIDY_REQUEST_STATE.REQUESTED,
              },
            ],
            [SUBSIDY_TYPE.COUPON]: [],
          },
        }}
      />,
    );
    expect(screen.getByText(SUBSCRIPTION_SUMMARY_CARD_TITLE));
    expect(screen.getByText(LICENSE_REQUESTED_NOTICE));
  });
  test('Subscription summary card is not displayed when enterprise subscription is not available and there is no pending license request', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={defaultUserSubsidyState}
      />,
    );
    expect(screen.queryByText(SUBSCRIPTION_SUMMARY_CARD_TITLE)).toBeFalsy();
  });
  test('Subscription summary card is not displayed when enterprise subscription is available but user license is not available', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{
          ...defaultUserSubsidyState,
          subscriptionPlan: {
            daysUntilExpiration: 70,
            isActive: true,
            expirationDate: '2021-10-25',
          },
        }}
      />,
    );
    expect(screen.queryByText(SUBSCRIPTION_SUMMARY_CARD_TITLE)).toBeFalsy();
  });
  test('Enterprise offers summary card is displayed when enterprise has active offers and no subscriptions or coupons or learner credit', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{
          ...defaultUserSubsidyState,
          customerAgreementConfig: undefined,
          enterpriseOffers: [mockEnterpriseOffer],
          canEnrollWithEnterpriseOffers: true,
        }}
      />,
    );
    expect(screen.getByText(ENTERPRISE_OFFER_SUMMARY_CARD_TITLE)).toBeInTheDocument();
  });
  test('Enterprise offers summary card is displayed when enterprise has active offers and has subscriptions', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{
          ...userSubsidyStateWithSubscription,
          enterpriseOffers: [mockEnterpriseOffer],
          canEnrollWithEnterpriseOffers: true,
        }}
      />,
    );

    expect(screen.queryByText(ENTERPRISE_OFFER_SUMMARY_CARD_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(SUBSCRIPTION_SUMMARY_CARD_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(COUPON_CODES_SUMMARY_NOTICE)).not.toBeInTheDocument();
  });
  test('Enterprise offers summary card is displayed when enterprise has active offers and has coupon codes', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{
          ...defaultUserSubsidyState,
          couponCodes: { ...defaultUserSubsidyState.couponCodes, couponCodesCount: 2 },
          enterpriseOffers: [mockEnterpriseOffer],
          canEnrollWithEnterpriseOffers: true,
        }}
      />,
    );
    expect(screen.queryByText(ENTERPRISE_OFFER_SUMMARY_CARD_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(SUBSCRIPTION_SUMMARY_CARD_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByText(COUPON_CODES_SUMMARY_NOTICE)).toBeInTheDocument();
  });

  test('Learner credit summary card is displayed when enterprise has learner credit', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{
          ...defaultUserSubsidyState,
          redeemableLearnerCreditPolicies: {
            redeemablePolicies: [{
              remainingBalancePerUser: 5,
              subsidyExpirationDate: '2030-01-01 12:00:00Z',
              active: true,
            }],
            learnerContentAssignments: emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          },
        }}
      />,
    );
    expect(screen.queryByText(LEARNER_CREDIT_SUMMARY_CARD_TITLE)).toBeInTheDocument();
  });

  test('Only learner credit summary card is displayed when enterprise has both; learner credit and offers', () => {
    const policyExpirationDate = '2030-01-01 12:00:00Z';
    const offerEndDate = '2027-10-25';
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{
          ...defaultUserSubsidyState,
          redeemableLearnerCreditPolicies: {
            redeemablePolicies: [{
              remainingBalancePerUser: 5,
              subsidyExpirationDate: policyExpirationDate,
              active: true,
            }],
            learnerContentAssignments: emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          },
          enterpriseOffers: [{
            uuid: 'enterprise-offer-id',
            endDatetime: offerEndDate,
          }],
          canEnrollWithEnterpriseOffers: true,
        }}
      />,
    );
    expect(screen.getByText('2030', { exact: false })).toBeInTheDocument();
    expect(screen.queryByText('2027', { exact: false })).toBeFalsy();
    expect(screen.getByText(LEARNER_CREDIT_CARD_SUMMARY)).toBeInTheDocument();
  });

  test('Only learner credit summary card with contact administrator is displayed when enterprise has assignable policy', () => {
    const policyExpirationDate = '2030-01-01 12:00:00Z';

    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{
          ...defaultUserSubsidyState,
          redeemableLearnerCreditPolicies: {
            redeemablePolicies: [{
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
          enterpriseOffers: [],
          canEnrollWithEnterpriseOffers: false,
        }}
      />,
    );
    expect(screen.getByText(LEARNER_CREDIT_ASSIGNMENT_ONLY_SUMMARY)).toBeInTheDocument();
  });

  test('Find a course button is not rendered when user has no coupon codes or license subsidy', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={{ enterpriseConfig: { slug: 'sluggykins', adminUsers: [] } }}
        initialUserSubsidyState={defaultUserSubsidyState}
      />,
    );
    const catalogAccessButton = screen.queryByText(CATALOG_ACCESS_CARD_BUTTON_TEXT);
    expect(catalogAccessButton).toBeFalsy();
  });
  test('Find a course button is not rendered when user has subsidy but customer has search disabled', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={{ enterpriseConfig: { disableSearch: true, adminUsers: [] } }}
        initialUserSubsidyState={userSubsidyStateWithSubscription}
      />,
    );
    const catalogAccessButton = screen.queryByText(CATALOG_ACCESS_CARD_BUTTON_TEXT);
    expect(catalogAccessButton).toBeFalsy();
  });
  test('Need help sidebar block is always rendered', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={defaultUserSubsidyState}
      />,
    );
    expect(screen.queryByText(NEED_HELP_BLOCK_TITLE)).toBeTruthy();
    expect(screen.queryByText(CONTACT_HELP_EMAIL_MESSAGE)).toBeTruthy();
  });
  test('Uses contact email first', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={{ enterpriseConfig: { contactEmail: 'edx@example.com', disableSearch: true, adminUsers: [{ email: 'admin@foo.com' }] } }}
        initialUserSubsidyState={userSubsidyStateWithSubscription}
      />,
    );
    expect(screen.getByText('contact your organization\'s edX administrator').closest('a')).toHaveAttribute('href', 'mailto:edx@example.com');
  });
  test('Falls back on admin emails if contact email is null', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={{ enterpriseConfig: { contactEmail: null, disableSearch: true, adminUsers: [{ email: 'admin@foo.com' }] } }}
        initialUserSubsidyState={userSubsidyStateWithSubscription}
      />,
    );
    expect(screen.getByText('contact your organization\'s edX administrator').closest('a')).toHaveAttribute('href', 'mailto:admin@foo.com');
  });
});
