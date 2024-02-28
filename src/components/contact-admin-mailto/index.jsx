import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { MailtoLink } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { getContactEmail } from '../../utils/common';

const ContactAdminMailto = ({
  children,
}) => {
  const { enterpriseConfig } = useContext(AppContext);
  const email = getContactEmail(enterpriseConfig);
  if (email) {
    return (
      <MailtoLink
        target="_blank"
        to={email}
      >
        {children}
      </MailtoLink>
    );
  }

  return children;
};

ContactAdminMailto.propTypes = {
  children: PropTypes.node,
};

ContactAdminMailto.defaultProps = {
  children: 'Contact your administrator',
};

export default ContactAdminMailto;
