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
  const appStateWithSubscription = {
    ...initialAppState,
    subscriptionPlan: {
      daysUntilExpiration: 70,
      expirationDate: '2021-10-25',
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
        initialAppState={appStateWithSubscription}
        initialUserSubsidyState={defaultUserSubsidyState}
      >
        <DashboardSidebar />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(SUBSCRIPTION_SUMMARY_CARD_TITLE)).toBeTruthy();
  });
  test('subscription summary card is not displayed when subscription is not available', () => {
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
  test('Find a course button is always rendered', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={{ enterpriseConfig: { slug: 'sluggykins' } }}
        initialUserSubsidyState={defaultUserSubsidyState}
      >
        <DashboardSidebar />
      </DashboardSidebarContext>,
    );
    const catalogAccessButton = screen.queryByText(CATALOG_ACCESS_CARD_BUTTON_TEXT);
    expect(catalogAccessButton).toBeTruthy();

    // ``hasAccessToPortal`` is set to true in defaultUserSubsidyState, so the button should
    // not be disabled.
    expect(catalogAccessButton.classList).not.toContain('disabled');
  });
  test('Find a course button is rendered as disabled when user has no portal access', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{
          ...defaultUserSubsidyState,
          hasAccessToPortal: false,
        }}
      >
        <DashboardSidebar />
      </DashboardSidebarContext>,
    );
    const catalogAccessButton = screen.queryByText(CATALOG_ACCESS_CARD_BUTTON_TEXT);
    expect(catalogAccessButton).toBeTruthy();
    expect(catalogAccessButton.classList).toContain('disabled');
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
