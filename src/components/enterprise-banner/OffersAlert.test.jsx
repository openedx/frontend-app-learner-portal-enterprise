import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import OffersAlert, { getOffersText } from './OffersAlert';

import { UserSubsidyContext } from '../enterprise-user-subsidy/UserSubsidy';

/* eslint-disable react/prop-types */
const OffersAlertWithContext = ({
  initialAppState = {},
  initialUserSubsidyState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <OffersAlert />
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('<OffersAlert />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
  };
  const initialUserSubsidyState = {
    offers: {
      loading: false,
      offers: [],
      offersCount: 3,
    },
  };

  it('renders an alert when loading is complete and there are offers', () => {
    render(<OffersAlertWithContext
      initialAppState={initialAppState}
      initialUserSubsidyState={initialUserSubsidyState}
    />);
    expect(screen.queryByText(getOffersText(initialUserSubsidyState.offers.offersCount))).toBeInTheDocument();
  });
  it('does not render an alert if there are no offers', () => {
    render(<OffersAlertWithContext
      initialAppState={initialAppState}
      initialUserSubsidyState={{
        ...initialUserSubsidyState,
        offers: { ...initialUserSubsidyState.offers, offersCount: 0 },
      }}
    />);
    expect(screen.queryByText(getOffersText(initialUserSubsidyState.offers.offersCount))).not.toBeInTheDocument();
  });
});
