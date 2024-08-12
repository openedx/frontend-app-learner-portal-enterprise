import { useContext } from 'react';
import { mount } from 'enzyme';
import { AppContext } from '@edx/frontend-platform/react';
import { getLoggingService } from '@edx/frontend-platform/logging';

import EnterprisePage from './EnterprisePage';
import { useEnterpriseCustomer } from '../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../app/data/services/data/__factories__';

jest.mock('../app/data', () => ({
  ...jest.requireActual('../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-platform/logging', () => ({
  getLoggingService: jest.fn(),
}));
const mockSetCustomAttribute = jest.fn();
getLoggingService.mockReturnValue({
  setCustomAttribute: mockSetCustomAttribute,
});

describe('<EnterprisePage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  const defaultAppContextValue = { authenticatedUser: mockAuthenticatedUser };

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
        authenticatedUser: mockAuthenticatedUser,
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
