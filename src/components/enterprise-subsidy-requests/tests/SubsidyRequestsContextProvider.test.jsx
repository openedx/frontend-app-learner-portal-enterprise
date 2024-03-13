import React from 'react';

import { screen, render } from '@testing-library/react';
import SubsidyRequestsContextProvider from '../SubsidyRequestsContextProvider';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { LOADING_SCREEN_READER_TEXT } from '../../../constants';
import { useEnterpriseCustomer } from '../../app/data';
import {
  useCatalogsForSubsidyRequests,
  useSubsidyRequestConfiguration,
  useSubsidyRequests,
} from '../data';

jest.mock('../../../config');
jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  useSubsidyRequestConfiguration: jest.fn(),
  useSubsidyRequests: jest.fn(),
  useCatalogsForSubsidyRequests: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const SubsidyRequestsContextProviderWrapper = ({
  initialUserSubsidyState = {
    couponCodes: {
      couponCodes: [],
      couponCodesCount: 0,
      couponsOverview: { data: undefined },
    },
    customerAgreementConfig: {
      subscriptions: [],
    },
  },
}) => (
  <UserSubsidyContext.Provider value={initialUserSubsidyState}>
    <SubsidyRequestsContextProvider>
      <div>children</div>
    </SubsidyRequestsContextProvider>
  </UserSubsidyContext.Provider>
);

describe('<SubsidyRequestsContextProvider />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: { uuid: 'test-enterprise-uuid' } });
    useSubsidyRequestConfiguration.mockReturnValue({
      subsidyRequestConfiguration: {},
      isLoading: false,
    });
    useSubsidyRequests.mockReturnValue({
      couponCodeRequests: [],
      licenseRequests: [],
      isLoading: false,
    });
    useCatalogsForSubsidyRequests.mockReturnValue({
      catalogs: [],
      isLoading: false,
    });
  });

  it('should fetch subsidy requests information if feature is enabled', () => {
    render(<SubsidyRequestsContextProviderWrapper />);

    expect(useSubsidyRequestConfiguration).toHaveBeenCalled();
    expect(useSubsidyRequests).toHaveBeenCalled();
    expect(useCatalogsForSubsidyRequests).toHaveBeenCalled();
  });

  it('should render loading spinner if loading subsidy requests information', () => {
    useSubsidyRequestConfiguration.mockReturnValue({
      subsidyRequestConfiguration: {},
      isLoading: true,
    });
    useSubsidyRequests.mockReturnValue({
      couponCodeRequests: [],
      licenseRequests: [],
      isLoading: false,
    });

    render(<SubsidyRequestsContextProviderWrapper />);
    expect(screen.getByText(LOADING_SCREEN_READER_TEXT));
  });
});
