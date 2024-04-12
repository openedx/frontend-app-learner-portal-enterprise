import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useAsyncError, useRouteError } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../utils/tests';
import RouteErrorBoundary from './RouteErrorBoundary';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteError: jest.fn(),
  useAsyncError: jest.fn(),
}));

const RouteErrorBoundaryWrapper = () => (
  <IntlProvider locale="en">
    <RouteErrorBoundary />
  </IntlProvider>
);

describe('RouteErrorBoundary', () => {
  beforeEach(() => {
    useRouteError.mockReturnValue(null);
    useAsyncError.mockReturnValue(null);

    // Mock global.location.href
    delete global.location;
    global.location = { href: 'https://example.com/slug' };
  });

  it('displays the error page correctly when there is a route error', () => {
    useRouteError.mockReturnValue(new Error('RouteError'));
    renderWithRouterProvider(<RouteErrorBoundaryWrapper />);
    expect(screen.getByText('An error occurred while processing your request')).toBeInTheDocument();
    expect(screen.getByText('We apologize for the inconvenience. Please try again later.')).toBeInTheDocument();
  });

  it('displays the error page correctly when there is an async error', () => {
    useAsyncError.mockReturnValue(new Error('AsyncError'));
    renderWithRouterProvider(<RouteErrorBoundaryWrapper />);
    expect(screen.getByText('An error occurred while processing your request')).toBeInTheDocument();
    expect(screen.getByText('We apologize for the inconvenience. Please try again later.')).toBeInTheDocument();
  });

  it('displays the update available modal correctly when there is a ChunkLoadError route error', async () => {
    const chunkLoadError = new Error('ChunkLoadError');
    chunkLoadError.name = 'ChunkLoadError';
    useRouteError.mockReturnValue(chunkLoadError);
    renderWithRouterProvider(<RouteErrorBoundaryWrapper />);
    expect(screen.getByText('Update: New Version Available')).toBeInTheDocument();
    expect(screen.getByText('Attention: A new version of the website was released. To leverage the latest features and improvements, please perform a page refresh.')).toBeInTheDocument();
    const refreshButton = screen.getByText('Refresh', { selector: 'a' });
    // Click on the "Refresh" button; should still be on same location href.
    userEvent.click(refreshButton);
    expect(global.location.href).toBe('https://example.com/slug');
  });

  it('refreshes the page when "Try again" button is clicked', () => {
    renderWithRouterProvider(<RouteErrorBoundaryWrapper />);

    // Click on the "Try again" button; should still be on same location href.
    userEvent.click(screen.getByText('Try again'));
    expect(global.location.href).toBe('https://example.com/slug');
  });
});
