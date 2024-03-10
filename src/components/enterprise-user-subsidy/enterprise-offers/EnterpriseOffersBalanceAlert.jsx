import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Container, Alert, MailtoLink } from '@openedx/paragon';
import { WarningFilled, Error } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  OFFER_BALANCE_CLICK_EVENT,
} from './data/constants';
import { getContactEmail } from '../../../utils/common';
import { useEnterpriseCustomer } from '../../app/data';

const EnterpriseOffersBalanceAlert = ({ hasNoEnterpriseOffersBalance }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const intl = useIntl();

  const variant = hasNoEnterpriseOffersBalance ? 'danger' : 'warning';
  const icon = hasNoEnterpriseOffersBalance ? Error : WarningFilled;
  const heading = hasNoEnterpriseOffersBalance ? intl.formatMessage({
    id: 'enterprise.search.page.offers.balance.alert.no.balance.heading',
    defaultMessage: "Courses are no longer covered by your organization's learner credit balance",
    description: 'Heading for the enterprise offers balance alert when the learner credit balance is zero.',
  }) : intl.formatMessage({
    id: 'enterprise.search.page.offers.balance.alert.low.balance.heading',
    defaultMessage: "Some courses may not be covered by your organization's learner credit balance",
    description: 'Heading for the enterprise offers balance alert when the learner credit balance is low.',
  });
  const text = hasNoEnterpriseOffersBalance ? intl.formatMessage({
    id: 'enterprise.search.page.offers.balance.alert.no.balance.description',
    defaultMessage: 'Your learner credit balance has run out, and will not cover the cost of courses. Please contact your administrator if you have questions.',
    description: 'Description for the enterprise offers balance alert when the learner credit balance is zero.',
  }) : intl.formatMessage({
    id: 'enterprise.search.page.offers.balance.alert.low.balance.description',
    defaultMessage: 'Your organization is running low on learner credit. Some courses may no longer be covered. Please contact your administrator if you have questions.',
    description: 'Description for the enterprise offers balance alert when the learner credit balance is low.',
  });

  const email = getContactEmail(enterpriseCustomer);
  const actions = email ? [
    <MailtoLink
      to={email}
      target="_blank"
      onClick={() => {
        sendEnterpriseTrackEvent(
          enterpriseCustomer.uuid,
          OFFER_BALANCE_CLICK_EVENT,
        );
      }}
    >
      <FormattedMessage
        id="enterprise.search.page.offers.balance.alert.contact.admin.button"
        defaultMessage="Contact administrator"
        description="Button text for contacting the administrator on the enterprise offers balance alert."
      />
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
