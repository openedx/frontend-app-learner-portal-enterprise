import React, { useContext } from 'react';
import classNames from 'classnames';

import { Container, Alert, MailtoLink } from '@edx/paragon';
import { WarningFilled } from '@edx/paragon/icons';
import { AppContext } from '@edx/frontend-platform/react';

import { LOW_BALANCE_CONTACT_ADMIN_TEXT, LOW_BALANCE_ALERT_HEADING, LOW_BALANCE_ALERT_TEXT } from './data/constants';

const EnterpriseOffersLowBalanceAlert = () => {
  const {
    enterpriseConfig: { adminUsers },
  } = useContext(AppContext);

  const adminEmails = adminUsers.map(user => user.email);
  const hasAdminEmails = adminEmails.length > 0;

  const actions = hasAdminEmails ? [
    <MailtoLink
      to={adminEmails}
      target="_blank"
    >{LOW_BALANCE_CONTACT_ADMIN_TEXT}
    </MailtoLink>,
  ] : [];

  return (
    <Container size="lg" className="pt-3">
      <Alert
        className={classNames({ 'low-offers-balance-alert-with-cta': hasAdminEmails })}
        variant="warning"
        icon={WarningFilled}
        actions={actions}
      >
        <Alert.Heading>{LOW_BALANCE_ALERT_HEADING}</Alert.Heading>
        <p>
          {LOW_BALANCE_ALERT_TEXT}
        </p>
      </Alert>
    </Container>
  );
};

export default EnterpriseOffersLowBalanceAlert;
