import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';

import { AppContext } from '@edx/frontend-platform/react';
import { UserSubsidyContext } from '../../enterprise-user-subsidy/UserSubsidy';
import DashboardSidebar, {
  EMAIL_MESSAGE,
} from './DashboardSidebar';
import {
  OFFER_SUMMARY_TITLE,
} from './OfferSummaryCard';

import { renderWithRouter } from '../../../utils/tests';

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
  const defaultOffersState = {
    offers: [],
    loading: false,
    offersCount: 0,
  };
  const initialAppState = {
    enterpriseConfig: { contactEmail: 'foo@foo.com' },
    name: 'Bears Inc.',
  };
  test('Email message is displayed', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{ offers: defaultOffersState }}
      >
        <DashboardSidebar />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(EMAIL_MESSAGE)).toBeTruthy();
  });
  test('sidebar card is displayed when offers are available', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{ offers: { ...defaultOffersState, offersCount: 2 } }}
      >
        <DashboardSidebar />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(OFFER_SUMMARY_TITLE)).toBeTruthy();
  });
  test('sidebar card is not displayed when no offers are available', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
        initialUserSubsidyState={{ offers: { defaultOffersState } }}
      >
        <DashboardSidebar />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(OFFER_SUMMARY_TITLE)).toBeFalsy();
  });
});
