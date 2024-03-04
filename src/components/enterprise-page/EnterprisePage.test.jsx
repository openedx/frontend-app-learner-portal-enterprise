import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';

import EnterprisePage from './EnterprisePage';
import * as hooks from './data/hooks';
import { queryCacheOnErrorHandler } from '../../utils/common';

const mockUser = {
  profileImage: 'http://fake.image',
  username: 'joe_shmoe',
};
jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-platform/react', () => ({
  esModule: true,
  ...jest.requireActual('@edx/frontend-platform/react'),
  ErrorPage: () => <div data-testid="error-page" />,
}));
jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockReturnValue({ enterpriseSlug: 'test-enterprise-slug' }),
}));

describe('<EnterprisePage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: queryCacheOnErrorHandler,
    }),
  });

  const defaultAppContextValue = { authenticatedUser: { ...mockUser } };

  const EnterprisePageWrapper = ({ children, appContextValue = defaultAppContextValue }) => (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={appContextValue}>
        <EnterprisePage>
          {children}
        </EnterprisePage>
      </AppContext.Provider>
    </QueryClientProvider>
  );

  describe('renders loading state', () => {
    it('while fetching enterprise config', () => {
      // mock hook as if async call to fetch enterprise config is still resolving
      jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [undefined, undefined]);
      const wrapper = render(
        <EnterprisePageWrapper>
          <div className="did-i-render" />
        </EnterprisePageWrapper>,
      );
      expect(wrapper.container.querySelector('.loading-spinner')).toBeTruthy();
    });
    it('while hydrating user metadata', () => {
      // mock hook as if async call to fetch enterprise config is fully resolved
      jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [{}, undefined]);
      const wrapper = render(
        <EnterprisePageWrapper appContextValue={{ authenticatedUser: {} }}>
          <div className="did-i-render" />
        </EnterprisePageWrapper>,
      );
      expect(wrapper.container.querySelector('.loading-spinner')).toBeTruthy();
    });
  });
  it('populates AppContext with expected values', () => {
    const mockEnterpriseConfig = {
      slug: 'test-slug',
      uuid: 'test-uuid',
    };
    const isLoading = false;

    jest.spyOn(hooks, 'useUpdateActiveEnterpriseForUser').mockImplementation(() => ({ isLoading }));
    jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [mockEnterpriseConfig, undefined]);

    const ChildComponent = () => {
      const contextValue = useContext(AppContext);
      return <div className="did-i-render" data-contextvalue={JSON.stringify(contextValue)} />;
    };
    const wrapper = render(
      <EnterprisePageWrapper>
        <ChildComponent />
      </EnterprisePageWrapper>,
    );

    const actualContextValue = JSON.parse(wrapper.container.querySelector('.did-i-render').getAttribute('data-contextvalue'));
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
  it('renders error state when unable to fetch enterprise config', () => {
    // mock hook as if async call to fetch enterprise config is fully resolved
    jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [null, new Error('test error')]);
    render(
      <EnterprisePageWrapper>
        <div className="did-i-render" />
      </EnterprisePageWrapper>,
    );
    expect(screen.getByTestId('error-page')).toBeTruthy();
  });
  it('renders not found page when no enterprise config is found', () => {
    // mock hook as if async call to fetch enterprise config is fully resolved
    jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [null, undefined]);
    render(
      <EnterprisePageWrapper>
        <div className="did-i-render" />
      </EnterprisePageWrapper>,
    );
    expect(screen.getByTestId('not-found-page')).toBeTruthy();
  });
  it('renders error page when there is a fetch error', () => {
    const errorMessage = 'Test fetch error';
    jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [null, new Error(errorMessage)]);
    const wrapper = render(
      <EnterprisePageWrapper>
        <div className="did-i-render" />
      </EnterprisePageWrapper>,
    );
    expect(wrapper.getByTestId('error-page')).toBeTruthy();
  });

  it('renders not found page when enterprise config is defined and null', () => {
    jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [null, undefined]);
    render(
      <EnterprisePageWrapper>
        <div className="did-i-render" />
      </EnterprisePageWrapper>,
    );
    expect(screen.getByTestId('not-found-page')).toBeTruthy();
  });
});
