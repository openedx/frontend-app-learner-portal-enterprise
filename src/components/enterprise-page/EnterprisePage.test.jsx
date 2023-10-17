import React, { useContext } from 'react';
import { screen, render, within } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom/extend-expect';

import EnterprisePage from './EnterprisePage';
import { useEnterpriseCustomerConfig } from './data';

const mockEnterpriseUUID = 'test-enterprise-uuid';
const mockUser = {
  roles: [`enterprise_learner:${mockEnterpriseUUID}`],
  profileImage: 'http://fake.image',
};

const defaultAppContextValue = {
  authenticatedUser: mockUser, // default context value includes already hydrated user metadata
};

jest.mock('./data', () => ({
  ...jest.requireActual('./data'),
  useEnterpriseCustomerConfig: jest.fn().mockReturnValue([
    { uuid: 'test-enterprise-uuid' },
    undefined,
  ]),
}));

const EnterprisePageWrapper = ({
  appContextValue = defaultAppContextValue,
  children,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={appContextValue}>
      <EnterprisePage>
        {children || <div className="did-i-render" />}
      </EnterprisePage>
    </AppContext.Provider>
  </IntlProvider>
);

describe('EnterprisePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state while fetching enterprise config', () => {
    useEnterpriseCustomerConfig.mockReturnValue([undefined, undefined]);
    render(<EnterprisePageWrapper />);
    const loadingSpinner = within(screen.getByRole('status'));
    expect(loadingSpinner.getByText('loading organization and user details')).toBeInTheDocument();
  });

  it('renders loading state while hydrating user profile metadata', () => {
    const appContextValue = {
      authenticatedUser: {
        ...mockUser,
        profileImage: undefined,
      },
    };
    render(<EnterprisePageWrapper appContextValue={appContextValue} />);
    const loadingSpinner = within(screen.getByRole('status'));
    expect(loadingSpinner.getByText('loading organization and user details')).toBeInTheDocument();
  });

  it('renders error state when unable to fetch enterprise config', () => {
    const errorMessage = 'test error';
    useEnterpriseCustomerConfig.mockReturnValue([null, new Error(errorMessage)]);
    render(<EnterprisePageWrapper />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Try again', { selector: 'a' })).toBeInTheDocument();
  });

  it('renders not found page when no enterprise config is found', () => {
    useEnterpriseCustomerConfig.mockReturnValue([null, undefined]);
    render(<EnterprisePageWrapper />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('something went wrong', { exact: false })).toBeInTheDocument();
  });

  it('populates AppContext with expected values', () => {
    const mockEnterpriseConfig = {
      slug: 'test-slug',
    };
    useEnterpriseCustomerConfig.mockReturnValue([mockEnterpriseConfig, undefined]);
    const ChildComponent = () => {
      const contextValue = useContext(AppContext);
      const contextValueAsString = JSON.stringify(contextValue);
      return <div data-testid="did-i-render" data-contextvalue={contextValueAsString} />;
    };
    render((
      <EnterprisePageWrapper>
        <ChildComponent />
      </EnterprisePageWrapper>
    ));
    const child = screen.getByTestId('did-i-render');
    const actualContextValue = JSON.parse(child.getAttribute('data-contextvalue'));
    expect(actualContextValue).toEqual(
      expect.objectContaining({
        authenticatedUser: mockUser,
        config: expect.any(Object),
        enterpriseConfig: mockEnterpriseConfig,
        courseCards: {
          'in-progress': {
            settingsMenu: {
              hasMarkComplete: true,
            },
          },
        },
        algolia: {
          client: expect.any(Object),
          index: expect.any(Object),
        },
      }),
    );
  });
});
