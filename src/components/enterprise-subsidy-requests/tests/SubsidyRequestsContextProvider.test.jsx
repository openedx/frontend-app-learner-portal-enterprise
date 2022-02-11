import React from 'react';

import { screen, render } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import SubsidyRequestsContextProvider from '../SubsidyRequestsContextProvider';
import * as config from '../../../config';
import * as hooks from '../data/hooks';
import { LOADING_SCREEN_READER_TEXT } from '../constants';

jest.mock('../../../config');
jest.mock('../data/hooks');

describe('<SubsidyRequestsContextProvider />', () => {
  const enterpriseConfig = {
    uuid: 'example-enterprise-uuid',
  };

  const renderWithChildren = () => render(
    <AppContext.Provider value={{ enterpriseConfig }}>
      <SubsidyRequestsContextProvider>
        <div>children</div>
      </SubsidyRequestsContextProvider>
    </AppContext.Provider>,
  );

  it('should provide default context if feature is disabled', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = false;
    renderWithChildren();

    expect(hooks.useSubsidyRequestConfiguration).not.toHaveBeenCalled();
    expect(hooks.useSubsidyRequests).not.toHaveBeenCalled();
  });

  it('should fetch subsidy requests information if feature is enabled', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = true;

    hooks.useSubsidyRequestConfiguration.mockReturnValue({
      subsidyRequestConfiguration: {},
    });
    hooks.useSubsidyRequests.mockReturnValue({
      couponCodeRequests: [],
      licenseRequests: [],
    });

    renderWithChildren();

    expect(hooks.useSubsidyRequestConfiguration).toHaveBeenCalled();
    expect(hooks.useSubsidyRequests).toHaveBeenCalled();
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

    renderWithChildren();
    expect(screen.getByText(LOADING_SCREEN_READER_TEXT));
  });
});
