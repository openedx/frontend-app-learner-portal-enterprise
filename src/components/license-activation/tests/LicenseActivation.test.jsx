import React from 'react';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import LicenseActivation, { LOADING_MESSAGE } from '../LicenseActivation';
import { useLicenseActivation } from '../data/hooks';

import { renderWithRouter } from '../../../utils/tests';

jest.mock('../data/hooks');

const TEST_ENTERPRISE_SLUG = 'test-enterprise-slug';
const TEST_ACTIVATION_KEY = '00000000-0000-0000-0000-000000000000';
const TEST_ROUTE = `/${TEST_ENTERPRISE_SLUG}/licenses/${TEST_ACTIVATION_KEY}/activate`;

const LicenseActivationWithAppContext = () => (
  <AppContext.Provider
    value={{
      enterpriseConfig: { slug: TEST_ENTERPRISE_SLUG, name: 'Test Enterprise' },
    }}
  >
    <LicenseActivation />
  </AppContext.Provider>
);

describe('LicenseActivation', () => {
  beforeEach(() => {
    useLicenseActivation.mockReset();
  });

  test('renders a loading message initially', async () => {
    // For the initial state, there is no activation success or error
    useLicenseActivation.mockReturnValue([false, false]);
    const Component = <LicenseActivationWithAppContext />;
    const { history } = renderWithRouter(Component, {
      route: TEST_ROUTE,
    });

    // assert component is initially loading and displays the loading message as screenreader text
    expect(screen.queryAllByText(LOADING_MESSAGE)).toHaveLength(1);

    // assert we did NOT get redirected
    expect(history.location.pathname).toEqual(TEST_ROUTE);
  });

  test('renders an error alert when there is an activation error', async () => {
    useLicenseActivation.mockReturnValue([false, true]);
    const Component = <LicenseActivationWithAppContext />;
    const { history } = renderWithRouter(Component, {
      route: TEST_ROUTE,
    });

    // assert an error alert appears
    expect(screen.getByRole('alert')).toHaveClass('alert-danger');

    // assert we did NOT get redirected
    expect(history.location.pathname).toEqual(TEST_ROUTE);
  });

  test('redirects on activation success', async () => {
    useLicenseActivation.mockReturnValue([true, false]);
    const Component = <LicenseActivationWithAppContext />;
    const { history } = renderWithRouter(Component, {
      route: TEST_ROUTE,
    });

    // assert we were redirected to the dashboard
    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}`);
  });
});
