import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../../utils/tests';
import SubscriptionSummaryCard from '../SubscriptionSummaryCard';
import {
  LICENSE_REQUESTED_NOTICE,
  SUBSCRIPTION_ACTIVE_BADGE_LABEL,
  SUBSCRIPTION_ACTIVE_BADGE_VARIANT,
  SUBSCRIPTION_ACTIVE_DATE_PREFIX,
  SUBSCRIPTION_EXPIRED_BADGE_LABEL,
  SUBSCRIPTION_EXPIRED_BADGE_VARIANT,
  SUBSCRIPTION_EXPIRED_DATE_PREFIX,
  SUBSCRIPTION_EXPIRING_SOON_BADGE_LABEL,
  SUBSCRIPTION_WARNING_BADGE_LABEL,
  SUBSCRIPTION_WARNING_BADGE_VARIANT,
} from '../data/constants';
import { SUBSCRIPTION_EXPIRING_MODAL_TITLE } from '../../../program-progress/data/constants';
import { useBrowseAndRequest, useEnterpriseCustomer, useSubscriptions } from '../../../app/data';
import { enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useSubscriptions: jest.fn(),
  useBrowseAndRequest: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const subscriptionPlan = {
  daysUntilExpirationIncludingRenewals: 70,
  expirationDate: '2021-10-25',
  isCurrent: true,
};

const subscriptions = {
  subscriptionPlan,
  showExpirationNotifications: true,
};
const licenseRequest = {
  courseEndDate: '2021-10-25',
};

const requests = {
  subscriptionLicenses: [licenseRequest],
};

describe('<SubscriptionSummaryCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useSubscriptions.mockReturnValue({ data: subscriptions });
    useBrowseAndRequest.mockReturnValue({ data: { requests } });
  });
  test('Active success badge is displayed when daysUntilExpirationIncludingRenewals > 60', () => {
    renderWithRouter(
      <IntlProvider locale="en">
        <SubscriptionSummaryCard />
      </IntlProvider>,
    );
    expect(screen.queryByText(SUBSCRIPTION_ACTIVE_BADGE_LABEL)).toBeTruthy();
    expect(screen.queryByText(SUBSCRIPTION_ACTIVE_DATE_PREFIX, { exact: false })).toBeTruthy();
    expect(screen.queryByTestId('subscription-status-badge')).toHaveClass(`badge-${SUBSCRIPTION_ACTIVE_BADGE_VARIANT}`);
  });
  test('Expiring warning badge is displayed when 60 >= daysUntilExpirationIncludingRenewals > 0', () => {
    const expiringSoonSubscriptionPlan = {
      ...subscriptionPlan,
      daysUntilExpirationIncludingRenewals: 50,
    };

    const updatedSubscriptions = {
      subscriptionPlan: expiringSoonSubscriptionPlan,
      showExpirationNotifications: true,
    };
    useSubscriptions.mockReturnValue({ data: updatedSubscriptions });
    renderWithRouter(
      <IntlProvider locale="en">
        <SubscriptionSummaryCard />
      </IntlProvider>,
    );
    expect(screen.queryByText(SUBSCRIPTION_WARNING_BADGE_LABEL)).toBeTruthy();
    expect(screen.queryByText(SUBSCRIPTION_ACTIVE_DATE_PREFIX, { exact: false })).toBeTruthy();
    expect(screen.queryByTestId('subscription-status-badge')).toHaveClass(`badge-${SUBSCRIPTION_WARNING_BADGE_VARIANT}`);
  });
  test('Expired danger badge is displayed when 0 <= daysUntilExpirationIncludingRenewals and isCurrent is false and card body indicates expiration', () => {
    const expiredSubscriptionPlan = {
      ...subscriptionPlan,
      daysUntilExpirationIncludingRenewals: 0,
      isCurrent: false,
    };
    const updatedSubscriptions = {
      subscriptionPlan: expiredSubscriptionPlan,
      showExpirationNotifications: true,
    };
    useSubscriptions.mockReturnValue({ data: updatedSubscriptions });
    renderWithRouter(
      <IntlProvider locale="en">
        <SubscriptionSummaryCard />
      </IntlProvider>,
    );
    expect(screen.queryByText(SUBSCRIPTION_EXPIRED_BADGE_LABEL)).toBeTruthy();
    expect(screen.queryByText(SUBSCRIPTION_EXPIRED_DATE_PREFIX, { exact: false })).toBeTruthy();
    expect(screen.queryByText('Oct 25, 2021')).toBeTruthy();
    expect(screen.queryByTestId('subscription-status-badge')).toHaveClass(`badge-${SUBSCRIPTION_EXPIRED_BADGE_VARIANT}`);
  });
  test('Expiring soon and modal warning badge is displayed when 60 >= daysUntilExpirationIncludingRenewals > 0 and programProgressPage=true', async () => {
    const user = userEvent.setup();
    const expiringSoonSubscriptionPlan = {
      ...subscriptionPlan,
      daysUntilExpirationIncludingRenewals: 50,
    };
    const updatedSubscriptions = {
      subscriptionPlan: expiringSoonSubscriptionPlan,
      showExpirationNotifications: true,
    };
    const courseEndDate = '2023-08-11';
    useSubscriptions.mockReturnValue({ data: updatedSubscriptions });
    renderWithRouter(
      <IntlProvider locale="en">
        <SubscriptionSummaryCard
          courseEndDate={courseEndDate}
          programProgressPage
        />
      </IntlProvider>,
    );
    expect(screen.queryByText(SUBSCRIPTION_EXPIRING_SOON_BADGE_LABEL)).toBeTruthy();
    expect(screen.queryByText(SUBSCRIPTION_ACTIVE_DATE_PREFIX, { exact: false })).toBeTruthy();
    expect(screen.queryByTestId('subscription-status-badge')).toHaveClass(`badge-${SUBSCRIPTION_WARNING_BADGE_VARIANT}`);
    expect(screen.queryByTestId('warning-icon')).toBeInTheDocument();
    await user.click(screen.queryByTestId('warning-icon'));
    expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeTruthy();
  });
  test('License requested notice is displayed when license request active', () => {
    const noSubscriptionPlan = {
      subscriptionPlan: null,
      showExpirationNotifications: true,
    };
    useSubscriptions.mockReturnValue({ data: noSubscriptionPlan });

    renderWithRouter(
      <IntlProvider locale="en">
        <SubscriptionSummaryCard programProgressPage courseEndDate={licenseRequest.courseEndDate} />
      </IntlProvider>,
    );
    expect(screen.queryByText(LICENSE_REQUESTED_NOTICE)).toBeTruthy();
  });
  test('Expired danger badge is displayed when 0 <= daysUntilExpirationIncludingRenewals, and isCurrent is false and program progress is enabled', () => {
    const expiredSubscriptionPlan = {
      ...subscriptionPlan,
      daysUntilExpirationIncludingRenewals: 0,
      isCurrent: false,
    };
    const updatedSubscriptions = {
      subscriptionPlan: expiredSubscriptionPlan,
      showExpirationNotifications: true,
    };
    useSubscriptions.mockReturnValue({ data: updatedSubscriptions });
    renderWithRouter(
      <IntlProvider locale="en">
        <SubscriptionSummaryCard
          programProgressPage
        />
      </IntlProvider>,
    );
    expect(screen.queryByText(SUBSCRIPTION_EXPIRED_BADGE_LABEL)).toBeTruthy();
    expect(screen.queryByText(SUBSCRIPTION_EXPIRED_DATE_PREFIX, { exact: false })).toBeTruthy();
    expect(screen.queryByText('Oct 25, 2021')).toBeTruthy();
    expect(screen.queryByTestId('subscription-status-badge')).toHaveClass(`badge-${SUBSCRIPTION_EXPIRED_BADGE_VARIANT}`);
  });
});
