import React, { useContext } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Container, Alert, MailtoLink } from '@openedx/paragon';
import { WarningFilled, Error } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { AppContext } from '@edx/frontend-platform/react';
import {
  LOW_BALANCE_CONTACT_ADMIN_TEXT,
  LOW_BALANCE_ALERT_HEADING,
  LOW_BALANCE_ALERT_TEXT,
  NO_BALANCE_CONTACT_ADMIN_TEXT,
  NO_BALANCE_ALERT_HEADING,
  NO_BALANCE_ALERT_TEXT,
  OFFER_BALANCE_CLICK_EVENT,
} from './data/constants';
import { getContactEmail } from '../../../utils/common';

const EnterpriseOffersBalanceAlert = ({ hasNoEnterpriseOffersBalance }) => {
  const {
    enterpriseConfig, enterpriseConfig: { uuid: enterpriseCustomerUUID },
  } = useContext(AppContext);

  const adminText = hasNoEnterpriseOffersBalance ? NO_BALANCE_CONTACT_ADMIN_TEXT : LOW_BALANCE_CONTACT_ADMIN_TEXT;
  const variant = hasNoEnterpriseOffersBalance ? 'danger' : 'warning';
  const icon = hasNoEnterpriseOffersBalance ? Error : WarningFilled;
  const heading = hasNoEnterpriseOffersBalance ? NO_BALANCE_ALERT_HEADING : LOW_BALANCE_ALERT_HEADING;
  const text = hasNoEnterpriseOffersBalance ? NO_BALANCE_ALERT_TEXT : LOW_BALANCE_ALERT_TEXT;

  const email = getContactEmail(enterpriseConfig);
  const actions = email ? [
    <MailtoLink
      to={email}
      target="_blank"
      onClick={() => {
        sendEnterpriseTrackEvent(
          enterpriseCustomerUUID,
          OFFER_BALANCE_CLICK_EVENT,
        );
      }}
    >
      {adminText}
    </MailtoLink>,
  ] : [];

  return (
    <Container size="lg" className="pt-3">
      <Alert
        className={classNames({ 'balance-alert-with-cta': email })}
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
