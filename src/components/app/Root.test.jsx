import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom/extend-expect';

import { QueryClientProvider } from '@tanstack/react-query';
import Root from './Root';
import { queryClient, renderWithRouterProvider } from '../../utils/tests';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  ScrollRestoration: jest.fn().mockImplementation(() => <div data-testid="scroll-restoration" />),
  Outlet: jest.fn().mockImplementation(() => <div data-testid="outlet" />),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getLoginRedirectUrl: jest.fn().mockReturnValue('http://test-login-redirect-url'),
}));

const baseAppContextValue = {
  config: {},
  authenticatedUser: {
    userId: 3,
    username: 'edx',
  },
};

const hydratedUserAppContextValue = {
  ...baseAppContextValue,
  authenticatedUser: {
    ...baseAppContextValue.authenticatedUser,
    profileImage: {
      url: 'http://test-profile-image-url',
    },
  },
};

const unauthenticatedAppContextValue = {
  ...baseAppContextValue,
  authenticatedUser: null,
};

const RootWrapper = ({
  children,
  appContextValue = hydratedUserAppContextValue,
}) => (
  <IntlProvider locale="en">
    <QueryClientProvider client={queryClient()}>
      <AppContext.Provider value={appContextValue}>
        <Root>
          {children}
        </Root>
      </AppContext.Provider>
    </QueryClientProvider>
  </IntlProvider>
);

describe('Root tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('page shows logout component user is not authenticated', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: (
        <RootWrapper appContextValue={unauthenticatedAppContextValue}>
          <div data-testid="hidden-children" />
        </RootWrapper>
      ),
    }, {
      initialEntries: ['/test-enterprise?logout=true'],
    });
    expect(screen.getByText('You are now logged out.')).toBeInTheDocument();
    expect(screen.queryByTestId('hidden-children')).not.toBeInTheDocument();
  });

  test('page renders nothing loader when user is authenticated but not hydrated', () => {
    const { container } = renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: (
        <RootWrapper appContextValue={baseAppContextValue}>
          <div data-testid="hidden-children" />
        </RootWrapper>
      ),
    }, {
      initialEntries: ['/test-enterprise?logout=true'],
    });
    expect(container).toBeEmptyDOMElement();
  });

  test('page renders child routes', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: (
        <RootWrapper>
          <div data-testid="hidden-children" />
        </RootWrapper>
      ),
    }, {
      initialEntries: ['/test-enterprise?logout=true'],
    });
    expect(screen.queryByText('You are now logged out.')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hidden-children')).not.toBeInTheDocument(); // Root does not render children; it renders child routes via Outlet
    expect(screen.getByTestId('scroll-restoration')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
});
