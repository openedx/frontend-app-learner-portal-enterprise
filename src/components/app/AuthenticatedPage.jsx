import PropTypes from 'prop-types';

import { EnterprisePage } from '../enterprise-page';

const AuthenticatedPage = ({ children }) => (
  <EnterprisePage>
    {children}
  </EnterprisePage>
);

AuthenticatedPage.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthenticatedPage;
