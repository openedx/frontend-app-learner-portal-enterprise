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
  OFFER_SUMMARY_NOTICE,
} from '../data/constants';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import CourseEnrollmentsContextProvider from '../../main-content/course-enrollments/CourseEnrollmentsContextProvider';
import { SubsidyRequestsContext } from '../../../enterprise-subsidy-requests';
import { SUBSIDY_REQUEST_STATE } from '../../../enterprise-subsidy-requests/constants';

jest.mock('../../main-content/course-enrollments/data/hooks', () => ({
  useCourseEnrollments: jest.fn(() => ({
    isLoading: false,
    courseEnrollmentsByStatus: {
      inProgress: [], upcoming: [], completed: [], savedForLater: [], requested: [],
    },
    fetchError: null,
    updateCourseEnrollmentStatus: () => {},
    programEnrollments: [],
  })),
}));

/* eslint-disable react/prop-types */
const DashboardSidebarWithContext = ({
  initialAppState = { fakeContext: 'foo' },
  initialUserSubsidyState = {},
  initialSubsidyRequestsState = {
    subsidyRequestConfiguration: {},
    licenseRequests: [],
    couponCodeRequests: [],
  },
  initialCourseEnrollmentsState = {
    courseEnrollmentsByStatus: {},
  },
}) => (
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
/* eslint-enable react/prop-types */

describe('<DashboardSidebar />', () => {
  const defaultUserSubsidyState = {
    subscriptionPlan: undefined,
    subscriptionLicense: undefined,
    offers: {
      offers: [],
      loading: false,
      offersCount: 0,
    },
  };
  const initialAppState = {
    enterpriseConfig: { contactEmail: 'foo@foo.com' },
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
  test('Offer summary card is displayed when offers are available', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{
          ...defaultUserSubsidyState,
          offers: { ...defaultUserSubsidyState.offers, offersCount: 2 },
        }}
      />,
    );
    expect(screen.getByText(OFFER_SUMMARY_NOTICE));
  });
  test('Offer summary card is displayed when there are pending coupon code requests', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={defaultUserSubsidyState}
        initialSubsidyRequestsState={{
          isLoading: false,
          couponCodeRequests: [
            {
              state: SUBSIDY_REQUEST_STATE.REQUESTED,
            },
          ],
          licenseRequests: [],
        }}
      />,
    );
    expect(screen.getByText(OFFER_SUMMARY_NOTICE));
  });
  test('Offer summary card is not displayed when there are no offers or pending coupon code requests', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={defaultUserSubsidyState}
      />,
    );
    expect(screen.queryByText(OFFER_SUMMARY_NOTICE)).toBeFalsy();
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
          isLoading: false,
          couponCodeRequests: [],
          licenseRequests: [
            {
              state: SUBSIDY_REQUEST_STATE.REQUESTED,
            },
          ],
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
  test('Find a course button is not rendered when user has no offer or license subsidy', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={{ enterpriseConfig: { slug: 'sluggykins' } }}
        initialUserSubsidyState={defaultUserSubsidyState}
      />,
    );
    const catalogAccessButton = screen.queryByText(CATALOG_ACCESS_CARD_BUTTON_TEXT);
    expect(catalogAccessButton).toBeFalsy();
  });
  test('Find a course button is not rendered when user has subsidy but customer has search disabled', () => {
    renderWithRouter(
      <DashboardSidebarWithContext
        initialAppState={{ enterpriseConfig: { disableSearch: true } }}
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
