import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import CouponCodesSummaryCard from '../CouponCodesSummaryCard';
import {
  COUPON_CODES_REQUESTED_BADGE_LABEL,
  COUPON_CODES_AVAILABLE_BADGE_LABEL,
  COUPON_CODES_SUMMARY_TITLE,
} from '../data/constants';

describe('<CouponCodesSummaryCard />', () => {
  it('should render coupon codes count with correct badge', () => {
    render(
      <IntlProvider locale="en">
        <CouponCodesSummaryCard couponCodesCount={3} couponCodeRequestsCount={1} />
      </IntlProvider>,
    );
    expect(screen.getByText(`${COUPON_CODES_SUMMARY_TITLE}: 3`));
    expect(screen.getByText(COUPON_CODES_AVAILABLE_BADGE_LABEL));
  });

  it('should render coupon code requests count with correct badge', () => {
    render(
      <IntlProvider locale="en">
        <CouponCodesSummaryCard couponCodesCount={0} couponCodeRequestsCount={3} />
      </IntlProvider>,
    );
    expect(screen.getByText(`${COUPON_CODES_SUMMARY_TITLE}`));
    expect(screen.getByText(COUPON_CODES_REQUESTED_BADGE_LABEL));
  });
});
