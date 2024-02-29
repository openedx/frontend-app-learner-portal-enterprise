import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { useLocation } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import '@testing-library/jest-dom/extend-expect';

import { QueryClientProvider } from '@tanstack/react-query';
import AuthenticatedPage from './AuthenticatedPage';
import { useEnterpriseLearner } from './data';
import { queryClient } from '../../utils/tests';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useParams: jest.fn(),
  useMatch: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-logistration', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-logistration'),
  LoginRedirect: jest.fn(({ children }) => children),
}));

jest.mock('../enterprise-page', () => ({
  ...jest.requireActual('../enterprise-page'),
  EnterprisePage: jest.fn(({ children }) => children),
}));

jest.mock('./data', () => ({
  ...jest.requireActual('./data'),
  useEnterpriseLearner: jest.fn(),
}));

const mockEnterpriseSlug = 'test-enterprise-slug';
// Force the location/route to be the Search page in order to
// make assertions on the "Recommend courses for me" button in
// the renderWithRoutered ``EnterpriseBanner`` component.
const mockLocation = { pathname: `/${mockEnterpriseSlug}/search` };

const defaultAppContextValue = {
  config: {},
  authenticatedUser: undefined,
};

const AuthenticatedPageWrapper = ({
  children,
  appContextValue = defaultAppContextValue,
}) => (
  <IntlProvider locale="en">
    <QueryClientProvider client={queryClient()}>
      <AppContext.Provider value={appContextValue}>
        <AuthenticatedPage>
          {children}
        </AuthenticatedPage>
      </AppContext.Provider>
    </QueryClientProvider>
  </IntlProvider>
);

const baseEnterpriseLearner = {
  enterpriseCustomer: {
    name: 'Test Enterprise Name',
    brandingConfiguration: {
      logo: 'test-logo',
    },
  },
  allLinkedEnterpriseCustomerUsers: [
    {
      enterpriseCustomer: {
        name: 'Test Enterprise Name',
      },
    }],
};
useEnterpriseLearner.mockImplementation(() => ({ data: baseEnterpriseLearner }));

describe('AuthenticatedPage tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TODO: move to tests about the new `Root` component
  test.skip('page shows logout component when logout mode is detected and user is logged off', () => {
    useLocation.mockReturnValue({ ...mockLocation, search: '?logout=true' });

    renderWithRouter(
      <AuthenticatedPageWrapper>
        <div data-testid="hidden-children" />
      </AuthenticatedPageWrapper>,
    );
    expect(screen.getByText('You are now logged out.')).toBeInTheDocument();
    expect(screen.queryByTestId('hidden-children')).not.toBeInTheDocument();
  });
});
