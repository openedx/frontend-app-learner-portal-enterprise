/* eslint-disable react/prop-types */
import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import EnterpriseOffersLowBalanceAlert from '../EnterpriseOffersLowBalanceAlert';
import { LOW_BALANCE_CONTACT_ADMIN_TEXT } from '../data/constants';

const EnterpriseOffersLowBalanceAlertWrapper = ({
  enterpriseConfig = {
    adminUsers: [],
  },
}) => (
  <AppContext.Provider value={{
    enterpriseConfig,
  }}
  >
    <EnterpriseOffersLowBalanceAlert />
  </AppContext.Provider>
);

describe('<EnterpriseOffersLowBalanceAlert />', () => {
  it('should not render mailto link if there are no enterprise admins', () => {
    render(<EnterpriseOffersLowBalanceAlertWrapper />);
    expect(screen.queryByText(LOW_BALANCE_CONTACT_ADMIN_TEXT)).not.toBeInTheDocument();
  });

  it('should render mailto link if there are enterprise admins', () => {
    const enterpriseConfig = {
      adminUsers: ['edx@example.org'],
    };
    render(<EnterpriseOffersLowBalanceAlertWrapper enterpriseConfig={enterpriseConfig} />);
    expect(screen.getByText(LOW_BALANCE_CONTACT_ADMIN_TEXT)).toBeInTheDocument();
  });
});
