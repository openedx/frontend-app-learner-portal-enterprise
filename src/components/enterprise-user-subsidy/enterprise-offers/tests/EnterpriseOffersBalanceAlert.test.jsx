/* eslint-disable react/prop-types */
import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import EnterpriseOffersBalanceAlert from '../EnterpriseOffersBalanceAlert';
import {
  LOW_BALANCE_ALERT_TEXT,
  LOW_BALANCE_CONTACT_ADMIN_TEXT,
  NO_BALANCE_ALERT_TEXT,
} from '../data/constants';

const mockUser = {
  userId: 1337,
};

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ mockUser }),
}));

const EnterpriseOffersBalanceAlertWrapper = ({
  enterpriseConfig = {
    adminUsers: [],
  },
  hasNoEnterpriseOffersBalance,
}) => (
  <AppContext.Provider value={{
    enterpriseConfig,
  }}
  >
    <EnterpriseOffersBalanceAlert
      hasNoEnterpriseOffersBalance={hasNoEnterpriseOffersBalance}
    />
  </AppContext.Provider>
);

describe('<EnterpriseOffersBalanceAlert />', () => {
  it('should not render mailto link if there are no enterprise admins', () => {
    render(<EnterpriseOffersBalanceAlertWrapper />);
    expect(screen.queryByText(LOW_BALANCE_CONTACT_ADMIN_TEXT)).not.toBeInTheDocument();
  });

  it('should render mailto link with no_balance text if there are enterprise admins', () => {
    const enterpriseConfig = {
      adminUsers: ['edx@example.org'],
    };
    render(
      <EnterpriseOffersBalanceAlertWrapper
        enterpriseConfig={enterpriseConfig}
        hasNoEnterpriseOffersBalance
      />,
    );
    expect(screen.getByText(NO_BALANCE_ALERT_TEXT)).toBeInTheDocument();
  });

  it('should render mailto link with low_balance text if there are enterprise admins', () => {
    const enterpriseConfig = {
      adminUsers: ['edx@example.org'],
    };
    render(<EnterpriseOffersBalanceAlertWrapper
      enterpriseConfig={enterpriseConfig}
      hasNoEnterpriseOffersBalance={false}
    />);
    expect(screen.getByText(LOW_BALANCE_ALERT_TEXT)).toBeInTheDocument();
  });
});
