import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';

import { AppContext } from '@edx/frontend-platform/react';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';
import DashboardSidebar, {
  CATALOG_ACCESS_CARD_BUTTON_TEXT,
  EMAIL_MESSAGE,
  NEED_HELP_BLOCK_TITLE,
} from '../DashboardSidebar';

import { renderWithRouter } from '../../../../utils/tests';
import { OFFER_SUMMARY_TITLE, SUBSCRIPTION_SUMMARY_CARD_TITLE } from '../data/constants';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';

/* eslint-disable react/prop-types */
const DashboardSidebarContext = ({
  initialAppState = { fakeContext: 'foo' },
  initialUserSubsidyState = {},
  children,
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      {children}
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<DashboardSidebar />', () => {
  const defaultUserSubsidyState = {
    subscriptionPlan: undefined,
    subscriptionLicense: undefined,
    hasAccessToPortal: true,
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
  test('offer summary card is displayed when offers are available', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{
          ...defaultUserSubsidyState,
          offers: { ...defaultUserSubsidyState.offers, offersCount: 2 },
        }}
      >
        <DashboardSidebar />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(OFFER_SUMMARY_TITLE)).toBeTruthy();
  });
  test('offer summary card is not displayed when no offers are available', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
        initialUserSubsidyState={defaultUserSubsidyState}
      >
        <DashboardSidebar />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(OFFER_SUMMARY_TITLE)).toBeFalsy();
  });
  test('subscription summary card is displayed when subscription is available', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
        initialUserSubsidyState={userSubsidyStateWithSubscription}
      >
        <DashboardSidebar />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(SUBSCRIPTION_SUMMARY_CARD_TITLE)).toBeTruthy();
  });
  test('subscription summary card is not displayed when enterprise subscription is not available', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
        initialUserSubsidyState={defaultUserSubsidyState}
      >
        <DashboardSidebar />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(SUBSCRIPTION_SUMMARY_CARD_TITLE)).toBeFalsy();
  });
  test('subscription summary card is not displayed when enterprise subscription is available but user license is not available', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{
          ...defaultUserSubsidyState,
          subscriptionPlan: {
            daysUntilExpiration: 70,
            isActive: true,
            expirationDate: '2021-10-25',
          },
        }}
      >
        <DashboardSidebar />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(SUBSCRIPTION_SUMMARY_CARD_TITLE)).toBeFalsy();
  });
  test('Find a course button is not rendered when user has no offer or license subsidy', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={{ enterpriseConfig: { slug: 'sluggykins' } }}
        initialUserSubsidyState={defaultUserSubsidyState}
      >
        <DashboardSidebar />
      </DashboardSidebarContext>,
    );
    const catalogAccessButton = screen.queryByText(CATALOG_ACCESS_CARD_BUTTON_TEXT);
    expect(catalogAccessButton).toBeFalsy();
  });
  test('Need help sidebar block is always rendered', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
        initialUserSubsidyState={defaultUserSubsidyState}
      >
        <DashboardSidebar />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(NEED_HELP_BLOCK_TITLE)).toBeTruthy();
    expect(screen.queryByText(EMAIL_MESSAGE)).toBeTruthy();
  });
});
