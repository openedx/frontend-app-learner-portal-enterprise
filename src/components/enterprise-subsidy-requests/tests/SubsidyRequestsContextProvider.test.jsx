/* eslint-disable react/prop-types */
import React from 'react';

import { screen, render } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import SubsidyRequestsContextProvider from '../SubsidyRequestsContextProvider';
import * as config from '../../../config';
import * as hooks from '../data/hooks';
import { LOADING_SCREEN_READER_TEXT } from '../constants';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

jest.mock('../../../config');
jest.mock('../data/hooks');

const enterpriseConfig = {
  uuid: 'example-enterprise-uuid',
};

const SubsidyRequestsContextProviderWrapper = ({
  initialAppState = {
    enterpriseConfig,
  },
  initialUserSubsidyState = {
    offers: {
      offers: [],
      offersCount: 0,
    },
    customerAgreementConfig: {
      subscriptions: [],
    },
  },
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <SubsidyRequestsContextProvider>
        <div>children</div>
      </SubsidyRequestsContextProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('<SubsidyRequestsContextProvider />', () => {
  beforeEach(() => {
    hooks.useSubsidyRequestConfiguration.mockReturnValue({
      subsidyRequestConfiguration: {},
      isLoading: false,
    });
    hooks.useSubsidyRequests.mockReturnValue({
      couponCodeRequests: [],
      licenseRequests: [],
      isLoading: false,
    });
    hooks.useCatalogsForSubsidyRequests.mockReturnValue({
      catalogs: [],
      isLoading: false,
    });
  });

  it('should provide default context if feature is disabled', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = false;
    render(<SubsidyRequestsContextProviderWrapper />);

    expect(hooks.useSubsidyRequestConfiguration).not.toHaveBeenCalled();
    expect(hooks.useSubsidyRequests).not.toHaveBeenCalled();
    expect(hooks.useCatalogsForSubsidyRequests).not.toHaveBeenCalled();
  });

  it('should fetch subsidy requests information if feature is enabled', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = true;

    render(<SubsidyRequestsContextProviderWrapper />);

    expect(hooks.useSubsidyRequestConfiguration).toHaveBeenCalled();
    expect(hooks.useSubsidyRequests).toHaveBeenCalled();
    expect(hooks.useCatalogsForSubsidyRequests).toHaveBeenCalled();
  });

  it('should render loading spinner if loading subsidy requests information', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = true;

    hooks.useSubsidyRequestConfiguration.mockReturnValue({
      subsidyRequestConfiguration: {},
      isLoading: true,
    });
    hooks.useSubsidyRequests.mockReturnValue({
      couponCodeRequests: [],
      licenseRequests: [],
      isLoading: false,
    });

    render(<SubsidyRequestsContextProviderWrapper />);
    expect(screen.getByText(LOADING_SCREEN_READER_TEXT));
  });
});
