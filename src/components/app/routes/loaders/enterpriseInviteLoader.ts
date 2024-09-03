import { generatePath, redirect } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';

import { postLinkEnterpriseLearner } from '../../data';
import { ensureAuthenticatedUser } from '../data';

type EnterpriseInviteParams<Key extends string = string> = Types.RouteParams<Key> & {
  readonly enterpriseCustomerInviteKey: string;
};
interface EnterpriseInviteLoaderFunctionArgs extends Types.RouteLoaderFunctionArgs {
  params: EnterpriseInviteParams;
}

/**
 * Route loader responsible for linking an authenticated user to an enterprise
 * customer based on the invite key in the route URL. If linking is successful,
 * the user is redirected to the dashboard route for the now-linked enterprise.
 */
const makeEnterpriseInviteLoader: Types.MakeRouteLoaderFunction = function makeEnterpriseInviteLoader() {
  return async function enterpriseInviteLoader({ params, request }: EnterpriseInviteLoaderFunctionArgs) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return redirect('/');
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
  };
};

export default makeEnterpriseInviteLoader;
