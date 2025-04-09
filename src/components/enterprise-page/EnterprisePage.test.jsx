import { useContext } from 'react';
import { screen, render } from '@testing-library/react';
import { mergeConfig } from '@edx/frontend-platform/config';
import { AppContext } from '@edx/frontend-platform/react';
import { getLoggingService } from '@edx/frontend-platform/logging';
import '@testing-library/jest-dom/extend-expect';

import EnterprisePage from './EnterprisePage';
import { useEnterpriseCustomer, useIsBFFEnabled } from '../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../app/data/services/data/__factories__';

jest.mock('../app/data', () => ({
  ...jest.requireActual('../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useIsBFFEnabled: jest.fn().mockReturnValue(false),
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

const defaultAppContextValue = {
  authenticatedUser: mockAuthenticatedUser,
};

const EnterprisePageWrapper = ({ children, appContextValue = defaultAppContextValue }) => (
  <AppContext.Provider value={appContextValue}>
    <EnterprisePage>
      {children}
    </EnterprisePage>
  </AppContext.Provider>
);

describe('<EnterprisePage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  it('populates AppContext with expected values', () => {
    mergeConfig({ example: true });
    const ExampleComponent = () => {
      const { authenticatedUser, config, courseCards } = useContext(AppContext);
      return (
        <div data-testid="did-i-render">
          <div>
            {authenticatedUser.username}
          </div>
          <div>
            {config.example ? 'hasConfig' : 'noConfig'}
          </div>
          <div>
            {courseCards['in-progress'].settingsMenu.hasMarkComplete ? 'hasMarkComplete' : 'noMarkComplete'}
          </div>
        </div>
      );
    };
    render(
      <EnterprisePageWrapper>
        <ExampleComponent />
      </EnterprisePageWrapper>,
    );

    expect(screen.getByText(mockAuthenticatedUser.username)).toBeInTheDocument();
    expect(screen.getByText('hasConfig')).toBeInTheDocument();
    expect(screen.getByText('hasMarkComplete')).toBeInTheDocument();
  });

  it.each([
    { isBFFEnabled: false },
    { isBFFEnabled: true },
  ])('sets custom attributes via logging service (%s)', ({ isBFFEnabled }) => {
    useIsBFFEnabled.mockReturnValue(isBFFEnabled);

    render(
      <EnterprisePageWrapper>
        <div data-testid="child-component" />
      </EnterprisePageWrapper>,
    );

    expect(mockSetCustomAttribute).toHaveBeenCalledTimes(2);
    expect(mockSetCustomAttribute).toHaveBeenCalledWith('enterprise_customer_uuid', mockEnterpriseCustomer.uuid);
    expect(mockSetCustomAttribute).toHaveBeenCalledWith('is_bff_enabled', isBFFEnabled);
  });
});
