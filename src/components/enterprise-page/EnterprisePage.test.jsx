import React, { useContext } from 'react';
import { mount } from 'enzyme';
import { AppContext } from '@edx/frontend-platform/react';

import EnterprisePage from './EnterprisePage';
import { useEnterpriseLearner } from '../app/data';

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
});
