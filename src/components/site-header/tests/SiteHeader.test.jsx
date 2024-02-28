import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { breakpoints } from '@openedx/paragon';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { MemoryRouter } from 'react-router-dom';
import SiteHeader from '../SiteHeader';

import { renderWithRouter, queryClient } from '../../../utils/tests';
import { useEnterpriseLearner } from '../../app/data';

jest.mock('../../app/data', () => ({
  useEnterpriseLearner: jest.fn(),
}));

const appState = {
  enterpriseConfig: {
    name: 'BearsRUs',
    uuid: 'BearsRUs',
    slug: 'bears-r-us',
    branding: {
      logo: 'the-logo.jpg',
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
  <IntlProvider locale="en">
    <QueryClientProvider client={queryClient()}>
      <AppContext.Provider value={initialAppState}>
        <SiteHeader />
      </AppContext.Provider>
    </QueryClientProvider>
  </IntlProvider>
);

const mockWindowConfig = {
  type: 'screen',
  width: breakpoints.large.minWidth + 1,
  height: 800,
};

const baseEnterpriseLearner = {
  enterpriseCustomer: {
    name: 'BearsRUs',
    slug: 'bears-r-us',
    brandingConfiguration: {
      logo: 'test-logo.jpg',
    },
    disableSearch: false,
  },
  allLinkedEnterpriseCustomerUsers: [
    {
      enterpriseCustomer: {
        name: 'BearsRUs',
        slug: 'bears-r-us',
      },
    }],
};

describe('<SiteHeader />', () => {
  beforeEach(() => {
    window.matchMedia.setConfig(mockWindowConfig);
    jest.clearAllMocks();
  });

  test('renders link with logo to dashboard', () => {
    useEnterpriseLearner.mockReturnValue({ data: baseEnterpriseLearner });
    renderWithRouter(
      <SiteHeaderWithContext />,
    );
    expect(screen.getByTestId('header-logo-image-id'));
    expect(screen.getByTestId('header-logo-link-id'));
  });
  test('does not render link with logo to dashboard when search is disabled', () => {
    const disabledSearchEnterpriseLearner = {
      ...baseEnterpriseLearner,
      enterpriseCustomer: {
        ...baseEnterpriseLearner.enterpriseCustomer,
        disableSearch: true,
      },
    };
    useEnterpriseLearner.mockReturnValue({ data: disabledSearchEnterpriseLearner });
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
    useEnterpriseLearner.mockReturnValue({ data: baseEnterpriseLearner });
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
    const idpEnterpriseLearner = {
      ...baseEnterpriseLearner,
      enterpriseCustomer: {
        ...baseEnterpriseLearner.enterpriseCustomer,
        identityProvider: 'a-provider',
      },
    };
    useEnterpriseLearner.mockReturnValue({ data: idpEnterpriseLearner });
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
    useEnterpriseLearner.mockReturnValue({ data: baseEnterpriseLearner });
    render(
      <MemoryRouter initialEntries={[route]}>
        <SiteHeaderWithContext initialAppState={appState} />,
      </MemoryRouter>,
    );

    const getSmarterLogo = screen.queryByTestId('partner-header-logo-image-id');

    if (route.includes('executive-education-2u')) {
      expect(getSmarterLogo).toBeInTheDocument();
    } else {
      expect(getSmarterLogo).not.toBeInTheDocument();
    }
  });
});
