import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useAsyncError, useRouteError } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../utils/tests';
import AppErrorBoundary from './AppErrorBoundary';
import { authenticatedUserFactory } from './data/services/data/__factories__';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteError: jest.fn(),
  useAsyncError: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();

const AppErrorBoundaryWrapper = () => (
  <IntlProvider locale="en">
    <AppContext.Provider
      value={{
        authenticatedUser: mockAuthenticatedUser,
        config: {},
      }}
    >
      <AppErrorBoundary />
    </AppContext.Provider>
  </IntlProvider>
);
const originalNodeEnv = process.env.NODE_ENV;
describe('AppErrorBoundary', () => {
  beforeEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    useRouteError.mockReturnValue(null);
    useAsyncError.mockReturnValue(null);

    // Mock global.location.href
    delete global.location;
    global.location = { href: 'https://example.com/slug' };
  });

  it('displays the error page correctly when there is a route error', () => {
    useRouteError.mockReturnValue(new Error('RouteError'));
    renderWithRouterProvider(<AppErrorBoundaryWrapper />);
    expect(screen.getByText('An error occurred while processing your request')).toBeInTheDocument();
    expect(screen.getByText('We apologize for the inconvenience. Please try again later.')).toBeInTheDocument();
  });

  it('displays the error page correctly when there is an async error', () => {
    useAsyncError.mockReturnValue(new Error('AsyncError'));
    renderWithRouterProvider(<AppErrorBoundaryWrapper />);
    expect(screen.getByText('An error occurred while processing your request')).toBeInTheDocument();
    expect(screen.getByText('We apologize for the inconvenience. Please try again later.')).toBeInTheDocument();
  });

  it('uses customAttributes.httpErrorResponseData for axios errors', async () => {
    const user = userEvent.setup();
    const error = new Error('RouteErrorWithCustomAttributes');
    error.customAttributes = {
      httpErrorResponseData: {
        status: 404,
      },
    };
    useRouteError.mockReturnValue(error);
    renderWithRouterProvider(<AppErrorBoundaryWrapper />);
    expect(screen.getByText('An error occurred while processing your request')).toBeInTheDocument();
    expect(screen.getByText('We apologize for the inconvenience. Please try again later.')).toBeInTheDocument();
    await user.click(screen.getByText('View error details'));
    expect(screen.getByText('Custom attributes:', { exact: false })).toBeInTheDocument();
  });

  it('displays the update available modal correctly when there is a ChunkLoadError route error', async () => {
    const user = userEvent.setup();
    const chunkLoadError = new Error('ChunkLoadError');
    chunkLoadError.name = 'ChunkLoadError';
    useRouteError.mockReturnValue(chunkLoadError);
    renderWithRouterProvider(<AppErrorBoundaryWrapper />);
    expect(screen.getByText('Update: New Version Available')).toBeInTheDocument();
    expect(screen.getByText('Attention: A new version of the website was released. To leverage the latest features and improvements, please perform a page refresh.')).toBeInTheDocument();
    const refreshButton = screen.getByText('Refresh', { selector: 'a' });
    // Click on the "Refresh" button; should still be on same location href.
    await user.click(refreshButton);
    expect(global.location.href).toBe('https://example.com/slug');
  });

  it('refreshes the page when "Try again" button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouterProvider(<AppErrorBoundaryWrapper />);

    // Click on the "Try again" button; should still be on same location href.
    await user.click(screen.getByText('Try again'));
    expect(global.location.href).toBe('https://example.com/slug');
  });
});
