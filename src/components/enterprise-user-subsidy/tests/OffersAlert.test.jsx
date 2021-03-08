import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import OffersAlert, { getOffersText } from '../OffersAlert';
import { UserSubsidyContext } from '..';

/* eslint-disable react/prop-types */
const OffersAlertWithContext = ({
  subsidyContext = {},
}) => (
  <UserSubsidyContext.Provider value={subsidyContext}>
    <OffersAlert />
  </UserSubsidyContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<OffersAlert />', () => {
  it('renders an alert when loading is complete and there are offers', () => {
    const subsidyContext = {
      offers: {
        loading: false,
        offers: [],
        offersCount: 3,
      },
    };
    render(<OffersAlertWithContext subsidyContext={subsidyContext} />);
    expect(screen.queryByText(getOffersText(subsidyContext.offers.offersCount))).toBeInTheDocument();
  });
  it('does not render an alert if there are no offers', () => {
    const subsidyContext = {
      offers: {
        loading: false,
        offers: [],
        offersCount: 0,
      },
    };
    render(<OffersAlertWithContext subsidyContext={subsidyContext} />);
    expect(screen.queryByText(getOffersText(subsidyContext.offers.offersCount))).not.toBeInTheDocument();
  });
});
