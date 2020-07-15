import React from 'react';
import { screen } from '@testing-library/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import '@testing-library/jest-dom/extend-expect';

import LoginRedirect from '../LoginRedirect';

import { renderWithRouter } from '../../../utils/tests';

jest.mock('@edx/frontend-platform/auth');

const TEST_ENTERPRISE_SLUG = 'test-enterprise-slug';

const LoginRedirectWithChild = () => (
  <LoginRedirect>
    <span data-testid="did-i-render" />
  </LoginRedirect>
);
describe('LoginRedirect', () => {
  beforeEach(() => {
    getAuthenticatedUser.mockReset();
  });

  test('renders children if the user is authenticated', async () => {
    getAuthenticatedUser.mockReturnValue({ user: { email: 'test-user' } });
    const Component = <LoginRedirectWithChild />;
    const { history } = renderWithRouter(Component, {
      route: `/${TEST_ENTERPRISE_SLUG}`,
    });

    // assert children are rendered
    expect(screen.queryByTestId('did-i-render')).toBeInTheDocument();

    // assert we did NOT get redirected
    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}`);
  });

  test('does not render children (due to redirect) if the user is not authenticated', async () => {
    const Component = <LoginRedirectWithChild />;
    renderWithRouter(Component, {
      route: `/${TEST_ENTERPRISE_SLUG}`,
    });

    // assert children are not rendered
    expect(screen.queryByTestId('did-i-render')).not.toBeInTheDocument();
    // We don't test the redirect functionality explicitly as navigation is not currently supported by jsdom
  });
});
