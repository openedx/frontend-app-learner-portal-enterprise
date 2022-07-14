import React, { useContext } from 'react';
import classNames from 'classnames';

import { Container, Alert, MailtoLink } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';


const EnterpriseOffersBalanceAlert = ({
  adminText,
  alertClassName,
  alertVariant,
  alertIcon,
  alertHeading,
  alertText,
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
        className={classNames({ alertClassName: hasAdminEmails })}
        variant={alertVariant}
        icon={alertIcon}
        actions={actions}
      >
        <Alert.Heading>{alertHeading}</Alert.Heading>
        <p>
          {alertText}
        </p>
      </Alert>
    </Container>
  );
};

export default EnterpriseOffersBalanceAlert;
