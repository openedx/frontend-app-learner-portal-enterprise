import PropTypes from 'prop-types';
import qs from 'query-string';
import { useParams } from 'react-router-dom';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

/**
 * This wrapper component redirects the requester to our proxy login view with additional query parameters if they are
 * not already authenticated.
 *
 * @param {node} children The child nodes to render if there is an authenticated user.
 */
// TODO: Use this for all pages and remove requirement for authenticated users
export default function LoginRedirect({ children }) {
  const user = getAuthenticatedUser();

  if (user) {
    return children;
  }

  const { enterpriseSlug } = useParams();
  const options = {
    slug: enterpriseSlug,
    next: global.location,
  };
  const proxyLoginUrl = `${process.env.LMS_BASE_URL}/enterprise/proxy_login/?${qs.stringify(options)}`;
  global.location.href = proxyLoginUrl;
  return null;
}

LoginRedirect.propTypes = {
  children: PropTypes.node.isRequired,
};
