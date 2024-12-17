import { MailtoLink } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { getContactEmail } from '../../utils/common';
import { useEnterpriseCustomer } from '../app/data';

const ContactAdminMailto = ({
  children,
}) => {
  const { data: entepriseCustomer } = useEnterpriseCustomer();
  const email = getContactEmail(entepriseCustomer);
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
