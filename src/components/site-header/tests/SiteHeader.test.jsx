import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { breakpoints } from '@edx/paragon';

import { AppContext } from '@edx/frontend-platform/react';
import SiteHeader from '../SiteHeader';

import { renderWithRouter } from '../../../utils/tests';

const appState = {
  enterpriseConfig: {
    name: 'BearsRUs',
    uuid: 'BearsRUs',
    slug: 'bears-r-us',
    branding: {
      logo: 'the-logo',
    },
    disableSearch: false,
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: {
    username: 'papa',
    profileImage: 'papa-bear-image',
  },
};

/* eslint-disable react/prop-types */
const SiteHeaderWithContext = ({
  initialAppState = appState,
}) => (
  <AppContext.Provider value={initialAppState}>
    <SiteHeader />
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

const mockWindowConfig = {
  type: 'screen',
  width: breakpoints.large.minWidth + 1,
  height: 800,
};

describe('<SiteHeader />', () => {
  beforeEach(() => {
    window.matchMedia.setConfig(mockWindowConfig);
  });
  test('renders link with logo to dashboard', () => {
    renderWithRouter(
      <SiteHeaderWithContext />,
    );
    expect(screen.getByTestId('header-logo-image-id'));
    expect(screen.getByTestId('header-logo-link-id'));
  });
  test('does not render link with logo to dashboard when search is disabled', () => {
    const disableSearchAppState = {
      ...appState,
    };
    disableSearchAppState.enterpriseConfig.disableSearch = true;
    renderWithRouter(
      <SiteHeaderWithContext
        initialAppState={disableSearchAppState}
      />,
    );
    expect(screen.getByTestId('header-logo-image-id'));
    expect(screen.queryByTestId('header-logo-link-id')).toBeFalsy();
  });
});
