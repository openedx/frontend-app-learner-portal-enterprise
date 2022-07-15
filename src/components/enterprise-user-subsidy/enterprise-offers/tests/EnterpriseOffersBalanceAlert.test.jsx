/* eslint-disable react/prop-types */
import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { WarningFilled } from '@edx/paragon/icons';
import EnterpriseOffersBalanceAlert from '../EnterpriseOffersBalanceAlert';
import { LOW_BALANCE_ALERT_HEADING, LOW_BALANCE_ALERT_TEXT, LOW_BALANCE_CONTACT_ADMIN_TEXT } from '../data/constants';

const EnterpriseOffersBalanceAlertWrapper = ({
  enterpriseConfig = {
    adminUsers: [],
  },
}) => (
  <AppContext.Provider value={{
    enterpriseConfig,
  }}
  >
    <EnterpriseOffersBalanceAlert
      adminText={LOW_BALANCE_CONTACT_ADMIN_TEXT}
      alertClassName="low-offers-balance-alert-with-cta"
      alertVariant="warning"
      alertIcon={WarningFilled}
      alertHeading={LOW_BALANCE_ALERT_HEADING}
      alertText={LOW_BALANCE_ALERT_TEXT}
    />
  </AppContext.Provider>
);

describe('<EnterpriseOffersBalanceAlert />', () => {
  it('should not render mailto link if there are no enterprise admins', () => {
    render(<EnterpriseOffersBalanceAlertWrapper />);
    expect(screen.queryByText(LOW_BALANCE_CONTACT_ADMIN_TEXT)).not.toBeInTheDocument();
  });

  it('should render mailto link if there are enterprise admins', () => {
    const enterpriseConfig = {
      adminUsers: ['edx@example.org'],
    };
    render(<EnterpriseOffersBalanceAlertWrapper enterpriseConfig={enterpriseConfig} />);
    expect(screen.getByText(LOW_BALANCE_CONTACT_ADMIN_TEXT)).toBeInTheDocument();
  });
});
