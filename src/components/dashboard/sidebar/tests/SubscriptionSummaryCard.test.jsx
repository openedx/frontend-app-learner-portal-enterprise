import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../../../utils/tests';
import SubscriptionSummaryCard from '../SubscriptionSummaryCard';
import {
  SUBSCRIPTION_ACTIVE_BADGE_LABEL,
  SUBSCRIPTION_ACTIVE_BADGE_VARIANT,
  SUBSCRIPTION_ACTIVE_DATE_PREFIX,
  SUBSCRIPTION_EXPIRED_BADGE_LABEL,
  SUBSCRIPTION_EXPIRED_BADGE_VARIANT,
  SUBSCRIPTION_EXPIRED_DATE_PREFIX,
  SUBSCRIPTION_WARNING_BADGE_LABEL,
  SUBSCRIPTION_WARNING_BADGE_VARIANT,
} from '../data/constants';

describe('<SubscriptionSummaryCard />', () => {
  const subscriptionPlan = {
    daysUntilExpiration: 70,
    expirationDate: '2021-10-25',
  };
  test('Active success badge is displayed when daysUntilExpiration > 60', () => {
    renderWithRouter(
      <SubscriptionSummaryCard subscriptionPlan={subscriptionPlan} />,
    );
    expect(screen.queryByText(SUBSCRIPTION_ACTIVE_BADGE_LABEL)).toBeTruthy();
    expect(screen.queryByText(SUBSCRIPTION_ACTIVE_DATE_PREFIX, { exact: false })).toBeTruthy();
    expect(screen.queryByTestId('subscription-status-badge')).toHaveClass(`badge-${SUBSCRIPTION_ACTIVE_BADGE_VARIANT}`);
  });
  test('Expiring warning badge is displayed when 60 >= daysUntilExpiration > 0', () => {
    const expiringSoonSubscriptionPlan = {
      ...subscriptionPlan,
      daysUntilExpiration: 50,
    };
    renderWithRouter(
      <SubscriptionSummaryCard subscriptionPlan={expiringSoonSubscriptionPlan} />,
    );
    expect(screen.queryByText(SUBSCRIPTION_WARNING_BADGE_LABEL)).toBeTruthy();
    expect(screen.queryByText(SUBSCRIPTION_ACTIVE_DATE_PREFIX, { exact: false })).toBeTruthy();
    expect(screen.queryByTestId('subscription-status-badge')).toHaveClass(`badge-${SUBSCRIPTION_WARNING_BADGE_VARIANT}`);
  });
  test('Expired danger badge is displayed when 0 >= daysUntilExpiration and card body indicates expiration', () => {
    const expiredSubscriptionPlan = {
      ...subscriptionPlan,
      daysUntilExpiration: 0,
    };
    renderWithRouter(
      <SubscriptionSummaryCard subscriptionPlan={expiredSubscriptionPlan} />,
    );
    expect(screen.queryByText(SUBSCRIPTION_EXPIRED_BADGE_LABEL)).toBeTruthy();
    expect(screen.queryByText(SUBSCRIPTION_EXPIRED_DATE_PREFIX, { exact: false })).toBeTruthy();
    expect(screen.queryByTestId('subscription-status-badge')).toHaveClass(`badge-${SUBSCRIPTION_EXPIRED_BADGE_VARIANT}`);
  });
});
