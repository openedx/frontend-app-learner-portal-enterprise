import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import EnterpriseOffersBalanceAlert from '../EnterpriseOffersBalanceAlert';
import {
  LOW_BALANCE_ALERT_TEXT,
  LOW_BALANCE_CONTACT_ADMIN_TEXT,
  NO_BALANCE_ALERT_TEXT,
} from '../data/constants';
import { useEnterpriseCustomer } from '../../../app/data';

const mockEnterpriseCustomerWithoutAdminUsers = {
  adminUsers: [],
};
const mockEnterpriseCustomerWithAdminUsers = {
  adminUsers: ['edx@example.org'],
};

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const EnterpriseOffersBalanceAlertWrapper = ({
  hasNoEnterpriseOffersBalance,
}) => (
  <IntlProvider locale="en">
    <EnterpriseOffersBalanceAlert
      hasNoEnterpriseOffersBalance={hasNoEnterpriseOffersBalance}
    />
  </IntlProvider>
);

describe('<EnterpriseOffersBalanceAlert />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithAdminUsers });
  });

  it('should not render mailto link if there are no enterprise admins', () => {
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithoutAdminUsers });
    render(<EnterpriseOffersBalanceAlertWrapper />);
    expect(screen.queryByText(LOW_BALANCE_CONTACT_ADMIN_TEXT)).not.toBeInTheDocument();
  });

  it('should render mailto link with no_balance text if there are enterprise admins', () => {
    render(
      <EnterpriseOffersBalanceAlertWrapper hasNoEnterpriseOffersBalance />,
    );
    expect(screen.getByText(NO_BALANCE_ALERT_TEXT)).toBeInTheDocument();
  });

  it('should render mailto link with low_balance text if there are enterprise admins', () => {
    render(
      <EnterpriseOffersBalanceAlertWrapper hasNoEnterpriseOffersBalance={false} />,
    );
    expect(screen.getByText(LOW_BALANCE_ALERT_TEXT)).toBeInTheDocument();
  });
});
