import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import OfferSummaryCard from '../OfferSummaryCard';
import {
  COUPON_CODES_REQUESTED_BADGE_LABEL,
  OFFERS_AVAILABLE_BADGE_LABEL,
  OFFER_SUMMARY_TITLE,
} from '../data/constants';

describe('<OfferSummaryCard />', () => {
  it('should render offers count with correct badge', () => {
    render(<OfferSummaryCard offersCount={3} couponCodeRequestsCount={1} />);
    expect(screen.getByText(`${OFFER_SUMMARY_TITLE}: 3`));
    expect(screen.getByText(OFFERS_AVAILABLE_BADGE_LABEL));
  });

  it('should render coupon code requests count with correct badge', () => {
    render(<OfferSummaryCard offersCount={0} couponCodeRequestsCount={3} />);
    expect(screen.getByText(`${OFFER_SUMMARY_TITLE}`));
    expect(screen.getByText(COUPON_CODES_REQUESTED_BADGE_LABEL));
  });
});
