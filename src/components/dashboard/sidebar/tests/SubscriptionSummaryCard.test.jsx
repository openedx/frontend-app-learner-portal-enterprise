import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../../utils/tests';
import SubscriptionSummaryCard from '../SubscriptionSummaryCard';
import {
  SUBSCRIPTION_ACTIVE_BADGE_LABEL,
  SUBSCRIPTION_ACTIVE_BADGE_VARIANT,
  SUBSCRIPTION_ACTIVE_DATE_PREFIX,
  SUBSCRIPTION_EXPIRED_BADGE_LABEL,
  SUBSCRIPTION_EXPIRED_BADGE_VARIANT,
  SUBSCRIPTION_EXPIRED_DATE_PREFIX, SUBSCRIPTION_EXPIRING_SOON_BADGE_LABEL,
  SUBSCRIPTION_WARNING_BADGE_LABEL,
  SUBSCRIPTION_WARNING_BADGE_VARIANT,
} from '../data/constants';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';
import { TEST_EMAIL, TEST_ENTERPRISE_SLUG } from '../../../search/tests/constants';
import { SUBSCRIPTION_EXPIRING_MODAL_TITLE } from '../../../program-progress/data/constants';

const initialAppState = {
  enterpriseConfig: {
    name: 'BearsRUs',
    slug: TEST_ENTERPRISE_SLUG,
    contactEmail: TEST_EMAIL,
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
};

const defaultCouponCodesState = {
  couponCodes: [],
  loading: false,
  couponCodesCount: 0,
};

const initialUserSubsidyState = {
  couponCodes: defaultCouponCodesState,
  subscriptionPlan: {
    expirationDate: '2022-10-25',
  },
};

const SubscriptionSummaryCardForProgressPageWithContext = (props) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <SubscriptionSummaryCard {...props} />
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

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
    expect(screen.queryByText('October 25th, 2021')).toBeTruthy();
    expect(screen.queryByTestId('subscription-status-badge')).toHaveClass(`badge-${SUBSCRIPTION_EXPIRED_BADGE_VARIANT}`);
  });
  test('Expiring soon and modal warning badge is displayed when 60 >= daysUntilExpiration > 0 and programProgressPage=true', () => {
    const expiringSoonSubscriptionPlan = {
      ...subscriptionPlan,
      daysUntilExpiration: 50,
    };
    const courseEndDate = '2023-08-11';
    renderWithRouter(
      <SubscriptionSummaryCardForProgressPageWithContext
        subscriptionPlan={expiringSoonSubscriptionPlan}
        courseEndDate={courseEndDate}
        programProgressPage
      />,
    );
    expect(screen.queryByText(SUBSCRIPTION_EXPIRING_SOON_BADGE_LABEL)).toBeTruthy();
    expect(screen.queryByText(SUBSCRIPTION_ACTIVE_DATE_PREFIX, { exact: false })).toBeTruthy();
    expect(screen.queryByTestId('subscription-status-badge')).toHaveClass(`badge-${SUBSCRIPTION_WARNING_BADGE_VARIANT}`);
    expect(screen.queryByTestId('warning-icon')).toBeInTheDocument();
    userEvent.click(screen.queryByTestId('warning-icon'));
    expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeTruthy();
  });
});
