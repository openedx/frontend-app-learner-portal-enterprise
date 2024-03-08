import { generatePath, redirect } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';

import { postLinkEnterpriseLearner } from '../../data';
import { ensureAuthenticatedUser } from '../data';

/**
 * Route loader responsible for linking an authenticated user to an enterprise
 * customer based on the invite key in the route URL. If linking is successful,
 * the user is redirected to the dashboard route for the now-linked enterprise.
 *
 * @returns {*} - `null` or redirects after successful linking of user <> enterprise customer
 */
export default async function enterpriseInviteLoader({ params = {}, request }) {
  const requestUrl = new URL(request.url);
  const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
  // User is not authenticated, so we can't do anything in this loader.
  if (!authenticatedUser) {
    return null;
  }

  const { enterpriseCustomerInviteKey } = params;

  try {
    const linkedEnterpriseCustomerUser = await postLinkEnterpriseLearner(enterpriseCustomerInviteKey);
    const redirectPath = generatePath('/:enterpriseSlug', {
      enterpriseSlug: linkedEnterpriseCustomerUser.enterpriseCustomerSlug,
    });
    return redirect(redirectPath);
  } catch (error) {
    logError(error);
    return null;
  }
}
