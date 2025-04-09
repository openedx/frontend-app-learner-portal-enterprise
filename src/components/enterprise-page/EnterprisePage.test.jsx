import { render, screen } from '@testing-library/react';
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
  config: {
    FEATURE_ENABLE_BFF_API_FOR_ENTERPRISE_CUSTOMERS: [],
  },
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
    render(
      <EnterprisePageWrapper>
        <div data-testid="child-component" />
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
      }),
    );
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
