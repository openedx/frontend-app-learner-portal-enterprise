import React, { useContext } from 'react';
import { mount } from 'enzyme';
import { AppContext } from '@edx/frontend-platform/react';

import EnterprisePage from './EnterprisePage';
import { useEnterpriseLearner } from '../app/data';
import { LoadingSpinner } from '../loading-spinner';
import NotFoundPage from '../NotFoundPage';
import LicenseNotFound from '../license-activation/LicenseNotFound';
import * as hooks from './data/hooks';
import { queryCacheOnErrorHandler } from '../../utils/common';

jest.mock('../app/data', () => ({
  ...jest.requireActual('../app/data'),
  useEnterpriseLearner: jest.fn(),
}));
useEnterpriseLearner.mockReturnValue({
  data: {
    enterpriseCustomer: {
      id: 'test-enterprise-uuid',
    },
  },
});

const mockUser = {
  profileImage: 'http://fake.image',
  username: 'joe_shmoe',
};
jest.mock('@edx/frontend-platform/auth');
jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockReturnValue({ enterpriseSlug: 'test-enterprise-slug' }),
}));

describe('<EnterprisePage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultAppContextValue = { authenticatedUser: { ...mockUser } };

  const EnterprisePageWrapper = ({ children, appContextValue = defaultAppContextValue }) => (
    <AppContext.Provider value={appContextValue}>
      <EnterprisePage>
        {children}
      </EnterprisePage>
    </AppContext.Provider>
  );

  it('populates AppContext with expected values', () => {
    const ChildComponent = () => {
      const contextValue = useContext(AppContext);
      return <div className="did-i-render" data-contextvalue={contextValue} />;
    };
    const wrapper = mount(
      <EnterprisePageWrapper>
        <ChildComponent />
      </EnterprisePageWrapper>,
    );

    const actualContextValue = wrapper.find('.did-i-render').prop('data-contextvalue');
    expect(actualContextValue).toEqual(
      expect.objectContaining({
        authenticatedUser: mockUser,
        config: expect.any(Object),
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
  it('renders error page when there is a fetch error', () => {
    const errorMessage = 'Test fetch error';
    jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [null, new Error(errorMessage)]);
    const wrapper = mount(
      <EnterprisePageWrapper>
        <div className="did-i-render" />
      </EnterprisePageWrapper>,
    );
    expect(wrapper.find(ErrorPage).prop('message')).toEqual(errorMessage);
  });

  it('renders not found page when enterprise config is defined and null', () => {
    jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [null, undefined]);
    const wrapper = mount(
      <EnterprisePageWrapper>
        <div className="did-i-render" />
      </EnterprisePageWrapper>,
    );
    expect(wrapper.find(NotFoundPage)).toBeTruthy();
  });

  it('renders LicenseNotFound page when license activation pattern is matched', () => {
    // Mocking window.location.href to simulate a URL containing the license activation pattern
    delete window.location;
    window.location = { href: 'https://example.com/licenses/12345678-1234-5678-1234-567812345678/activate' };

    jest.spyOn(hooks, 'useEnterpriseCustomerConfig').mockImplementation(() => [null, undefined]);
    const wrapper = mount(
      <EnterprisePageWrapper>
        <div className="did-i-render" />
      </EnterprisePageWrapper>,
    );
    expect(wrapper.find(LicenseNotFound)).toBeTruthy();
  });
});
