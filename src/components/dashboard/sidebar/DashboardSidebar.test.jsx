import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { screen } from '@testing-library/react';
import {
  BaseDashboardSidebar,
  EMAIL_MESSAGE,
  OFFER_SUMMARY_TITLE,
  getLoaderAltText,
} from './DashboardSidebar';

import { renderWithRouter } from '../../../utils/tests';

/* eslint-disable react/prop-types */
const DashboardSidebarContext = ({
  initialAppState = { fakeContext: 'foo' },
  children,
}) => (
  <AppContext.Provider value={initialAppState}>
    {children}
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<DashboardSidebar />', () => {
  const defaultProps = {
    fetchOffers: () => {},
    isOffersLoading: false,
    offersCount: 0,
  };
  const initialAppState = {
    enterpriseConfig: { contactEmail: 'foo@foo.com' },
    name: 'Bears Inc.',
  };

  test('offers are fetched on mount', () => {
    const fetchOffersSpy = jest.fn();
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
      >
        <BaseDashboardSidebar {...defaultProps} fetchOffers={fetchOffersSpy} />
      </DashboardSidebarContext>,
    );

    expect(fetchOffersSpy).toHaveBeenCalledTimes(1);
  });
  test('offers are not fetched if they are already loading', () => {
    const fetchOffersSpy = jest.fn();
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
      >
        <BaseDashboardSidebar
          {...defaultProps}
          fetchOffers={fetchOffersSpy}
          isOffersLoading
        />
      </DashboardSidebarContext>,
    );

    expect(fetchOffersSpy).toHaveBeenCalledTimes(0);
  });
  test('Email message is displayed', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
      >
        <BaseDashboardSidebar
          {...defaultProps}
        />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(EMAIL_MESSAGE)).toBeTruthy();
  });
  test('Loader is displayed when offers are loading', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
      >
        <BaseDashboardSidebar
          {...defaultProps}
          isOffersLoading
        />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(getLoaderAltText(initialAppState.enterpriseConfig.name))).toBeTruthy();
  });
  test('Loader is not displayed when offers are not loading', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
      >
        <BaseDashboardSidebar
          {...defaultProps}
        />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(getLoaderAltText(initialAppState.enterpriseConfig.name))).toBeFalsy();
  });
  test('sidebar card is displayed when offers are available', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
      >
        <BaseDashboardSidebar
          {...defaultProps}
          offersCount={2}
        />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(OFFER_SUMMARY_TITLE)).toBeTruthy();
  });
  test('sidebar card is not displayed when no offers are available', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
      >
        <BaseDashboardSidebar
          {...defaultProps}
        />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(OFFER_SUMMARY_TITLE)).toBeFalsy();
  });
  test('sidebar card is not displayed when offers are loading', () => {
    renderWithRouter(
      <DashboardSidebarContext
        initialAppState={initialAppState}
      >
        <BaseDashboardSidebar
          {...defaultProps}
          offersCount={10}
          isOffersLoading
        />
      </DashboardSidebarContext>,
    );
    expect(screen.queryByText(OFFER_SUMMARY_TITLE)).toBeFalsy();
  });
});
