import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { BaseOffersAlert, getOffersText } from './OffersAlert';

describe('<OffersAlert />', () => {
  let props;
  beforeEach(() => {
    props = {
      fetchOffersAction: jest.fn(),
      isOffersLoading: false,
      offersCount: 5,
    };
  });
  it('fetches offers on mount', () => {
    render(<BaseOffersAlert {...props} />);
    expect(props.fetchOffersAction).toHaveBeenCalledTimes(1);
  });
  it('does not fetch offers if offers are loading', () => {
    render(<BaseOffersAlert {...props} isOffersLoading />);
    expect(props.fetchOffersAction).toHaveBeenCalledTimes(0);
  });
  it('renders an alert when loading is complete and there are offers', () => {
    render(<BaseOffersAlert {...props} />);
    expect(screen.queryByText(getOffersText(props.offersCount))).toBeInTheDocument();
  });
  it('does not render an alert if there are no offers', () => {
    render(<BaseOffersAlert {...props} offersCount={0} />);
    expect(screen.queryByText(getOffersText(props.offersCount))).not.toBeInTheDocument();
  });
});
