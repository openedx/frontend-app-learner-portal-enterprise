import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { breakpoints } from '@openedx/paragon';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { faker } from '@faker-js/faker';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import SiteHeader from '../SiteHeader';

import { renderWithRouter, renderWithRouterProvider } from '../../../utils/tests';
import { useAcademies, useEnterpriseCustomer, useEnterpriseLearner } from '../../app/data';
import {
  academiesFactory,
  authenticatedUserFactory,
  enterpriseCustomerFactory,
} from '../../app/data/services/data/__factories__';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseLearner: jest.fn(),
  useAcademies: jest.fn(),
  useEnterpriseCustomer: jest.fn(),
  useIsAssignmentsOnlyLearner: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory({
  disableSearch: false,
});
const mockAuthenticatedUser = authenticatedUserFactory({
  profile_image: {
    image_url_medium: faker.image.avatar(),
  },
});

const appState = {
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: mockAuthenticatedUser,
};

const SiteHeaderWithContext = ({
  initialAppState = appState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SiteHeader />
    </AppContext.Provider>
  </IntlProvider>
);

const mockWindowConfig = {
  type: 'screen',
  width: breakpoints.large.minWidth + 1,
  height: 800,
};

const baseEnterpriseLearner = {
  enterpriseCustomer: mockEnterpriseCustomer,
  allLinkedEnterpriseCustomerUsers: [
    {
      id: 3,
      active: true,
      enterpriseCustomer: mockEnterpriseCustomer,
    }],
};

describe('<SiteHeader />', () => {
  beforeEach(() => {
    window.matchMedia.setConfig(mockWindowConfig);
    jest.clearAllMocks();
    getConfig.mockReturnValue({
      BASE_URL: process.env.BASE_URL,
      LMS_BASE_URL: process.env.LMS_BASE_URL,
      LOGOUT_URL: process.env.LOGOUT_URL,
    });
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useEnterpriseLearner.mockReturnValue({
      data: {
        enterpriseCustomer: mockEnterpriseCustomer,
        allLinkedEnterpriseCustomerUsers: [
          {
            active: true,
            enterpriseCustomer: mockEnterpriseCustomer,
          },
        ],
      },
    });
    useAcademies.mockReturnValue({ data: academiesFactory(3) });
  });

  test('renders link with logo to dashboard', () => {
    renderWithRouter(
      <SiteHeaderWithContext />,
    );
    expect(screen.getByTestId('header-logo-image-id'));
    expect(screen.getByTestId('header-logo-link-id'));
  });
  test('does not render link with logo to dashboard when search is disabled', () => {
    const mockEnterpriseCustomerWithDisabledSearch = enterpriseCustomerFactory({
      disable_search: true,
    });
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithDisabledSearch });
    useEnterpriseLearner.mockReturnValue({
      data: {
        enterpriseCustomer: mockEnterpriseCustomerWithDisabledSearch,
        allLinkedEnterpriseCustomerUsers: [
          {
            active: true,
            enterpriseCustomer: mockEnterpriseCustomerWithDisabledSearch,
          },
        ],
      },
    });
    renderWithRouter(
      <SiteHeaderWithContext />,
    );
    expect(screen.getByTestId('header-logo-image-id'));
    expect(screen.queryByTestId('header-logo-link-id')).toBeFalsy();
  });
  test('renders regular logout link in absence of IDP', () => {
    useEnterpriseLearner.mockReturnValue({ data: baseEnterpriseLearner });
    renderWithRouter(
      <SiteHeaderWithContext initialAppState={appState} />,
    );

    userEvent.click(screen.getByText(mockAuthenticatedUser.username));
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    const logoutLink = screen.getByText('Sign out');
    // note: the values of these come from the process.env vars in setupTest.js
    expect(logoutLink.getAttribute('href')).toBe(`http://localhost:18000/logout?next=http://localhost:8734/${mockEnterpriseCustomer.slug}`);
  });
  test('renders logout-specific logout link in presence of IDP', () => {
    const mockEnterpriseCustomerWithIDP = enterpriseCustomerFactory({
      identity_provider: 'a-provider',
    });
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithIDP });
    useEnterpriseLearner.mockReturnValue({
      data: {
        enterpriseCustomer: mockEnterpriseCustomerWithIDP,
        allLinkedEnterpriseCustomerUsers: [
          {
            active: true,
            enterpriseCustomer: mockEnterpriseCustomerWithIDP,
          },
        ],
      },
    });
    renderWithRouter(
      <SiteHeaderWithContext />,
    );
    userEvent.click(screen.getByText(mockAuthenticatedUser.username));
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    const logoutLink = screen.getByText('Sign out');
    // note: the values of these come from the process.env vars in setupTest.js
    expect(logoutLink.getAttribute('href')).toEqual(
      `http://localhost:18000/logout?next=http://localhost:8734/${mockEnterpriseCustomer.slug}%3Flogout=true`,
    );
  });

  test.each([
    {
      route: '/slug/course/id',
      path: '/:enterpriseSlug/course/:courseKey',
    },
    {
      route: '/slug/executive-education-2u/course/id',
      path: '/:enterpriseSlug/:courseType/course/:courseKey',
    },
  ])('renders getSmarter logo only when on /executive-education-2u path', ({
    route,
  }) => {
    useEnterpriseLearner.mockReturnValue({ data: baseEnterpriseLearner });
    renderWithRouterProvider({
      element: <SiteHeaderWithContext initialAppState={appState} />,
      path: '/:enterpriseSlug/:courseType?/course/:courseKey',
    }, {
      initialEntries: [route],
    });
    const getSmarterLogo = screen.queryByTestId('partner-header-logo-image-id');
    if (route.includes('executive-education-2u')) {
      expect(getSmarterLogo).toBeInTheDocument();
    } else {
      expect(getSmarterLogo).not.toBeInTheDocument();
    }
  });
});
