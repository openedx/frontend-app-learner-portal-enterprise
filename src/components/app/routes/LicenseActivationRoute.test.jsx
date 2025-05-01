import { AppContext } from '@edx/frontend-platform/react';
import { mergeConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { authenticatedUserFactory } from '../data/services/data/__factories__';
import LicenseActivationRoute from './LicenseActivationRoute';

const mockAuthenticatedUser = authenticatedUserFactory();

const LicenseActivationRouteWrapper = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
      <LicenseActivationRoute />
    </AppContext.Provider>
  </IntlProvider>
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
    expect(screen.getByText('Oops!')).toBeInTheDocument();
    expect(screen.getByText('We can\'t find a license assigned to this account.')).toBeInTheDocument();
    expect(screen.getByText(mockAuthenticatedUser.email, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('You can try one of the following to resolve and access your subscription license:')).toBeInTheDocument();
  });
});
