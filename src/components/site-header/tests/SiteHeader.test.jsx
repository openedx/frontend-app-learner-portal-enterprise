import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { breakpoints } from '@openedx/paragon';
import userEvent from '@testing-library/user-event';

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

const SiteHeaderWithContext = ({
  initialAppState = appState,
}) => (
  <AppContext.Provider value={initialAppState}>
    <SiteHeader />
  </AppContext.Provider>
);

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
  test('renders regular logout link in absence of IDP', () => {
    renderWithRouter(
      <SiteHeaderWithContext initialAppState={appState} />,
    );

    userEvent.click(screen.getByText('papa'));
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    const logoutLink = screen.getByText('Sign out');
    // note: the values of these come from the process.env vars in setupTest.js
    expect(logoutLink.getAttribute('href')).toBe('http://localhost:18000/logout?next=http://localhost:8734/bears-r-us');
  });
  test('renders logout-specific logout link in presence of IDP', () => {
    const appStateWithIDP = {
      ...appState,
      enterpriseConfig: {
        ...appState.enterpriseConfig,
        identityProvider: 'a-provider',
      },
    };
    renderWithRouter(
      <SiteHeaderWithContext initialAppState={appStateWithIDP} />,
    );

    userEvent.click(screen.getByText('papa'));
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    const logoutLink = screen.getByText('Sign out');
    // note: the values of these come from the process.env vars in setupTest.js
    expect(logoutLink.getAttribute('href')).toBe('http://localhost:18000/logout?next=http://localhost:8734/bears-r-us%3Flogout=true');
  });

  test.each([{
    route: '/slug/executive-education-2u/course/id',
  }, {
    route: '/slug/course/id',
  }])('renders getSmarter logo when on /executive-education-2u path', ({
    route,
  }) => {
    renderWithRouter(
      <SiteHeaderWithContext initialAppState={appState} />,
      {
        route,
      },
    );

    const getSmarterLogo = screen.queryByTestId('partner-header-logo-image-id');

    if (route.includes('executive-education-2u')) {
      expect(getSmarterLogo).toBeInTheDocument();
    } else {
      expect(getSmarterLogo).not.toBeInTheDocument();
    }
  });
});
