import { AppContext } from '@edx/frontend-platform/react';
import { mergeConfig } from '@edx/frontend-platform';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { authenticatedUserFactory } from '../data/services/data/__factories__';
import LicenseActivationRoute from './LicenseActivationRoute';

const mockAuthenticatedUser = authenticatedUserFactory();

const LicenseActivationRouteWrapper = () => (
  <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
    <LicenseActivationRoute />
  </AppContext.Provider>
);

describe('LicenseActivationRoute', () => {
  beforeEach(() => {
    mergeConfig({
      LOGOUT_URL: 'https://example.com/logout',
      LMS_BASE_URL: 'https://example.com',
    });
  });

  it('should render expected UI', () => {
    render(<LicenseActivationRouteWrapper />);
    expect(screen.getByText('We\'re sorry.')).toBeInTheDocument();
    expect(screen.getByText('We can\'t find a subscription license assigned to this account.')).toBeInTheDocument();
    expect(screen.getByText(mockAuthenticatedUser.email, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('You can try the following to resolve and access your subscription license:')).toBeInTheDocument();
  });
});
