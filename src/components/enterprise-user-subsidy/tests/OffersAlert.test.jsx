import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import OffersAlert, { getOffersText } from '../OffersAlert';

describe('<OffersAlert />', () => {
  const offers = {
    loading: false,
    offers: [],
    offersCount: 3,
  };

  it('renders an alert when loading is complete and there are offers', () => {
    render(<OffersAlert offers={offers} />);
    expect(screen.queryByText(getOffersText(offers.offersCount))).toBeInTheDocument();
  });
  it('does not render an alert if there are no offers', () => {
    render(<OffersAlert offers={{ ...offers, offersCount: 0 }} />);
    expect(screen.queryByText(getOffersText(offers.offersCount))).not.toBeInTheDocument();
  });
});
