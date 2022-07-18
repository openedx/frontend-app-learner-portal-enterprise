import React, { useContext } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Container, Alert, MailtoLink } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

const EnterpriseOffersBalanceAlert = ({
  adminText,
  className,
  variant,
  icon,
  heading,
  text,
}) => {
  const {
    enterpriseConfig: { adminUsers },
  } = useContext(AppContext);

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
  adminText: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  variant: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  heading: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default EnterpriseOffersBalanceAlert;
