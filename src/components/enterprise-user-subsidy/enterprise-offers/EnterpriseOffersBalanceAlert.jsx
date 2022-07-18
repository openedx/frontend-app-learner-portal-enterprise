import React, { useContext } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Container, Alert, MailtoLink } from '@edx/paragon';
import { WarningFilled } from '@edx/paragon/icons';
import { AppContext } from '@edx/frontend-platform/react';
import {
  LOW_BALANCE_CONTACT_ADMIN_TEXT,
  LOW_BALANCE_ALERT_HEADING,
  LOW_BALANCE_ALERT_TEXT,
  NO_BALANCE_CONTACT_ADMIN_TEXT,
  NO_BALANCE_ALERT_HEADING,
  NO_BALANCE_ALERT_TEXT,
} from './data/constants';

const EnterpriseOffersBalanceAlert = ({ hasNoEnterpriseOffersBalance }) => {
  const {
    enterpriseConfig: { adminUsers },
  } = useContext(AppContext);

  const adminText = hasNoEnterpriseOffersBalance ? NO_BALANCE_CONTACT_ADMIN_TEXT : LOW_BALANCE_CONTACT_ADMIN_TEXT;
  const className = hasNoEnterpriseOffersBalance
    ? 'no-offers-balance-alert-with-cta' : 'low-offers-balance-alert-with-cta';
  const variant = hasNoEnterpriseOffersBalance ? 'danger' : 'warning';
  const icon = WarningFilled;
  const heading = hasNoEnterpriseOffersBalance ? NO_BALANCE_ALERT_HEADING : LOW_BALANCE_ALERT_HEADING;
  const text = hasNoEnterpriseOffersBalance ? NO_BALANCE_ALERT_TEXT : LOW_BALANCE_ALERT_TEXT;

  const adminEmails = adminUsers.map(user => user.email);
  const hasAdminEmails = adminEmails.length > 0;

  const actions = hasAdminEmails ? [
    <MailtoLink
      to={adminEmails}
      target="_blank"
    >{adminText}
    </MailtoLink>,
  ] : [];

  return (
    <Container size="lg" className="pt-3">
      <Alert
        className={classNames({ [`${className}`]: hasAdminEmails })}
        variant={variant}
        icon={icon}
        actions={actions}
      >
        <Alert.Heading>{heading}</Alert.Heading>
        <p>
          {text}
        </p>
      </Alert>
    </Container>
  );
};

EnterpriseOffersBalanceAlert.propTypes = {
  hasNoEnterpriseOffersBalance: PropTypes.bool.isRequired,
};

export default EnterpriseOffersBalanceAlert;
