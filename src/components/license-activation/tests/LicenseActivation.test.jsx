import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import * as reactRouterDom from 'react-router-dom';
import { Route } from 'react-router-dom';
import LicenseActivation, { LOADING_MESSAGE } from '../LicenseActivation';

import { renderWithRouter } from '../../../utils/tests';
import { UserSubsidyContext } from '../../enterprise-user-subsidy/UserSubsidy';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => ({})),
}));

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_ENTERPRISE_SLUG = 'test-enterprise-slug';
const TEST_ACTIVATION_KEY = '00000000-0000-0000-0000-000000000000';
const TEST_ROUTE = `/${TEST_ENTERPRISE_SLUG}/licenses/${TEST_ACTIVATION_KEY}/activate`;

const LicenseActivationWithAppContext = ({
  initialUserSubsidyState = {
    activateUserLicense: jest.fn(() => true),
  },
}) => (
  <AppContext.Provider
    value={{
      enterpriseConfig: {
        uuid: TEST_ENTERPRISE_UUID,
        slug: TEST_ENTERPRISE_SLUG,
        name: 'Test Enterprise',
      },
    }}
  >
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <Route exact path="/:enterpriseSlug/licenses/:activationKey/activate">
        <LicenseActivation />
      </Route>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('LicenseActivation', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders a loading message initially', async () => {
    // For the initial state, there is no activation success or error
    const mockActivateUserLicense = jest.fn();

    const { history } = renderWithRouter(
      <LicenseActivationWithAppContext
        initialUserSubsidyState={{
          activateUserLicense: mockActivateUserLicense,
        }}
      />,
      {
        route: TEST_ROUTE,
      },
    );

    await waitFor(() => {
      expect(mockActivateUserLicense).toHaveBeenCalledWith(false);

      // assert component is initially loading and displays the loading message as screenreader text
      expect(screen.queryAllByText(LOADING_MESSAGE)).toHaveLength(1);

      // assert we did NOT get redirected
      expect(history.location.pathname).toEqual(TEST_ROUTE);
    });
  });

  test('renders an error alert when activation failed', async () => {
    const mockActivateUserLicense = jest.fn().mockRejectedValueOnce(
      new Error("Couldn't activate license"),
    );

    const { history } = renderWithRouter(
      <LicenseActivationWithAppContext
        initialUserSubsidyState={{
          activateUserLicense: mockActivateUserLicense,
        }}
      />,
      {
        route: TEST_ROUTE,
      },
    );

    expect(mockActivateUserLicense).toHaveBeenCalledWith(false);

    await waitFor(() => {
      // assert an error alert appears
      expect(screen.getByRole('alert')).toHaveClass('alert-danger');

      // assert we did NOT get redirected
      expect(history.location.pathname).toEqual(TEST_ROUTE);
    });
  });

  test.each([undefined, '/some-page'])('redirects on activation success', async (redirectedFrom) => {
    if (redirectedFrom) {
      reactRouterDom.useLocation.mockReturnValue({
        state: {
          from: redirectedFrom,
        },
      });
    }

    const mockActivateUserLicense = jest.fn();
    const { history } = renderWithRouter(
      <LicenseActivationWithAppContext
        initialUserSubsidyState={{
          activateUserLicense: mockActivateUserLicense,
        }}
      />,
      {
        route: TEST_ROUTE,
      },
    );

    await waitFor(() => {
      expect(mockActivateUserLicense).toHaveBeenCalledWith(!!redirectedFrom);
      expect(history.location.pathname).toEqual(redirectedFrom ?? `/${TEST_ENTERPRISE_SLUG}`);
    });
  });
});
