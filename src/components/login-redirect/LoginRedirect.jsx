import PropTypes from 'prop-types';
import qs from 'query-string';
import { useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

/**
 * This wrapper component redirects the requester to our proxy login view with additional query parameters if they are
 * not already authenticated.
 *
 * @param {node} children The child nodes to render if there is an authenticated user.
 */
export default function LoginRedirect({ children }) {
  const config = getConfig();
  const user = getAuthenticatedUser();

  if (user) {
    return children;
  }

  const cookies = new Cookies();
  cookies.remove(config.INTEGRATION_WARNING_DISMISSED_COOKIE_NAME);

  const { enterpriseSlug } = useParams();
  const options = {
    enterprise_slug: enterpriseSlug,
    next: global.location,
  };
  const proxyLoginUrl = `${config.LMS_BASE_URL}/enterprise/proxy-login/?${qs.stringify(options)}`;
  global.location.href = proxyLoginUrl;
  return null;
}

LoginRedirect.propTypes = {
  children: PropTypes.node.isRequired,
};
