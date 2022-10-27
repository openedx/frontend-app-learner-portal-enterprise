import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';

import { AppContext } from '@edx/frontend-platform/react';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';
import DashboardSidebar from '../DashboardSidebar';
import { renderWithRouter } from '../../../../utils/tests';
import {
  SUBSCRIPTION_SUMMARY_CARD_TITLE, CATALOG_ACCESS_CARD_BUTTON_TEXT,
  CONTACT_HELP_EMAIL_MESSAGE,
  NEED_HELP_BLOCK_TITLE,
  LICENSE_REQUESTED_NOTICE,
  COUPON_CODES_SUMMARY_NOTICE,
  ENTERPRISE_OFFER_SUMMARY_CARD_TITLE,
} from '../data/constants';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import CourseEnrollmentsContextProvider from '../../main-content/course-enrollments/CourseEnrollmentsContextProvider';
import { SubsidyRequestsContext } from '../../../enterprise-subsidy-requests';
import { SUBSIDY_REQUEST_STATE, SUBSIDY_TYPE } from '../../../enterprise-subsidy-requests/constants';

/* eslint-disable react/prop-types */
function DashboardSidebarWithContext({
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
}) {
  return (
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
          <CourseEnrollmentsContextProvider value={initialCourseEnrollmentsState}>
            <DashboardSidebar />
          </CourseEnrollmentsContextProvider>
        </SubsidyRequestsContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  );
}
/* eslint-enable react/prop-types */

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
  test('Enterprise offers summary card is displayed when enterprise has active offers and no subscriptions or coupons', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{
          ...defaultUserSubsidyState,
          customerAgreementConfig: undefined,
          enterpriseOffers: [{
            uuid: 'enterprise-offer-id',
          }],
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
          enterpriseOffers: [{
            uuid: 'enterprise-offer-id',
          }],
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
          enterpriseOffers: [{
            uuid: 'enterprise-offer-id',
          }],
          canEnrollWithEnterpriseOffers: true,
        }}
      />,
    );
    expect(screen.queryByText(ENTERPRISE_OFFER_SUMMARY_CARD_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(SUBSCRIPTION_SUMMARY_CARD_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByText(COUPON_CODES_SUMMARY_NOTICE)).toBeInTheDocument();
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
});
