import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { MailtoLink } from '@edx/paragon';
import PropTypes from 'prop-types';

const ContactAdminMailto = ({
  children,
}) => {
  const { enterpriseConfig: { adminUsers } } = useContext(AppContext);
  const adminEmails = adminUsers.map(user => user.email);

  if (adminEmails.length > 0) {
    return (
      <MailtoLink
        target="_blank"
        to={adminEmails}
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
