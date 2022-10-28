import React, { useContext } from 'react';
import { mount } from 'enzyme';
import * as auth from '@edx/frontend-platform/auth';
import { ErrorPage, AppContext } from '@edx/frontend-platform/react';

import EnterprisePage from './EnterprisePage';
import { LoadingSpinner } from '../loading-spinner';
import NotFoundPage from '../NotFoundPage';
import * as hooks from './data/hooks';

const mockUser = {
  profileImage: 'http://fake.image',
};
jest.mock('@edx/frontend-platform/auth');
jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockReturnValue({ enterpriseSlug: 'test-enterprise-slug' }),
}));

describe('<EnterprisePage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('renders loading state', () => {
    it('while fetching enterprise config', () => {
      jest.spyOn(auth, 'getAuthenticatedUser').mockImplementation(() => mockUser);
      // mock hook as if async call to fetch enterprise config is still resolving
      jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [undefined, undefined]);
      const wrapper = mount(<EnterprisePage><div className="did-i-render" /></EnterprisePage>);
      expect(wrapper.find(LoadingSpinner)).toBeTruthy();
    });
    it('while hydrating user metadata', () => {
      jest.spyOn(auth, 'getAuthenticatedUser').mockImplementation(() => ({}));
      // mock hook as if async call to fetch enterprise config is fully resolved
      jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [{}, undefined]);
      const wrapper = mount(<EnterprisePage><div className="did-i-render" /></EnterprisePage>);
      expect(wrapper.find(LoadingSpinner)).toBeTruthy();
    });
  });
  it('renders error state when unable to fetch enterprise config', () => {
    jest.spyOn(auth, 'getAuthenticatedUser').mockImplementation(() => mockUser);
    // mock hook as if async call to fetch enterprise config is fully resolved
    jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [null, new Error('test error')]);
    const wrapper = mount(<EnterprisePage><div className="did-i-render" /></EnterprisePage>);
    expect(wrapper.find(ErrorPage)).toBeTruthy();
  });
  it('renders not found page when no enterprise config is found', () => {
    jest.spyOn(auth, 'getAuthenticatedUser').mockImplementation(() => mockUser);
    // mock hook as if async call to fetch enterprise config is fully resolved
    jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [null, undefined]);
    const wrapper = mount(<EnterprisePage><div className="did-i-render" /></EnterprisePage>);
    expect(wrapper.find(NotFoundPage)).toBeTruthy();
  });
  it('populates AppContext with expected values', () => {
    jest.spyOn(auth, 'getAuthenticatedUser').mockImplementation(() => mockUser);
    const mockEnterpriseConfig = {
      slug: 'test-slug',
    };
    jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [mockEnterpriseConfig, undefined]);
    const ChildComponent = () => {
      const contextValue = useContext(AppContext);
      return <div className="did-i-render" data-contextvalue={contextValue} />;
    };
    const wrapper = mount(<EnterprisePage><ChildComponent /></EnterprisePage>);
    const actualContextValue = wrapper.find('.did-i-render').prop('data-contextvalue');
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
