import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import dayjs from 'dayjs';
import SubscriptionStatusCard from '../SubscriptionStatusCard';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import {
  useEnterpriseCustomer,
  useHasAvailableSubsidiesOrRequests,
  useSubscriptions,
} from '../../app/data';

const appState = {
  authenticatedUser: authenticatedUserFactory(),
};

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useSubscriptions: jest.fn(),
  useHasAvailableSubsidiesOrRequests: jest.fn(),
}));

const SubscriptionStatusCardWrapper = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={appState}>
      <SubscriptionStatusCard />
    </AppContext.Provider>
  </IntlProvider>
);

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockHasAvailableSubsidiesOrRequests = {
  hasActiveLicenseOrLicenseRequest: false,
};
const mockSubscriptionPlan = {
  expirationDate: dayjs().add(70, 'days').toISOString(),
};
const mockActiveLicense = {
  hasActiveLicenseOrLicenseRequest: true,
};
const mockExpiredSubscriptionPlan = {
  expirationDate: dayjs().subtract(70, 'days').toISOString(),
};
describe('SubscriptionStatusCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useSubscriptions.mockReturnValue({ data: { subscriptionPlan: mockSubscriptionPlan } });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(mockHasAvailableSubsidiesOrRequests);
  });
  it('renders "Not Active" badge when no active license or license request', () => {
    const { getByText } = render(<SubscriptionStatusCardWrapper />);
    expect(getByText('Not Active')).toBeInTheDocument();
  });

  it('renders "Active" badge when there is an active license or license request', () => {
    useHasAvailableSubsidiesOrRequests.mockReturnValue(mockActiveLicense);
    const { getByText } = render(<SubscriptionStatusCardWrapper />);
    expect(getByText('Active')).toBeInTheDocument();
  });

  it('renders expiry date when subscription is active and has expiration date', () => {
    useHasAvailableSubsidiesOrRequests.mockReturnValue(mockActiveLicense);
    useSubscriptions.mockReturnValue({ data: { subscriptionPlan: mockExpiredSubscriptionPlan } });
    const { getByText } = render(<SubscriptionStatusCardWrapper />);
    expect(getByText('Available until')).toBeInTheDocument();
    expect(getByText(dayjs(mockExpiredSubscriptionPlan.expirationDate).format('MMMM Do, YYYY')));
  });

  it('does not render expiry date when subscription is not active', () => {
    useSubscriptions.mockReturnValue({ data: { subscriptionPlan: mockExpiredSubscriptionPlan } });
    const { queryByText } = render(<SubscriptionStatusCardWrapper />);
    expect(queryByText(dayjs(mockExpiredSubscriptionPlan.expirationDate).format('MMMM Do, YYYY'))).toBeNull();
  });
});
