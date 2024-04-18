import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import dayjs from 'dayjs';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import BudgetExpiryNotification from '../index';
import { useEnterpriseCustomer, useHasAvailableSubsidiesOrRequests } from '../../app/data';

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useHasAvailableSubsidiesOrRequests: jest.fn(),
}));

const defaultAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const BudgetExpiryNotificationWithAppContext = ({
  initialAppState = defaultAppState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <BudgetExpiryNotification />
    </AppContext.Provider>
  </IntlProvider>
);

describe('<BudgetExpiryNotification />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(
      { learnerCreditSummaryCardData: { expirationDate: dayjs().add(120, 'day') } },
    );
  });

  it('renders Alert and Modal when date is not within expiry threshold', () => {
    render(<BudgetExpiryNotificationWithAppContext />);

    expect(screen.queryByText('Reminder: Your organization’s plan expires', { exact: false })).not.toBeInTheDocument();
    expect(screen.queryByText('When your organization’s plan expires,', { exact: false })).not.toBeInTheDocument();
  });

  it('renders Alert and Modal when date is within expiry threshold', () => {
    useHasAvailableSubsidiesOrRequests.mockReturnValue(
      { learnerCreditSummaryCardData: { expirationDate: dayjs().add(30, 'day') } },
    );

    render(<BudgetExpiryNotificationWithAppContext />);

    expect(screen.getByText('Reminder: Your organization’s plan expires', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('When your organization’s plan expires,', { exact: false })).toBeInTheDocument();
  });
});
