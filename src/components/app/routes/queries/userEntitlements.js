import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { enterpriseQueryKeys } from '../../../../utils/react-query-factory';

/**
 * TODO
 * @returns
 */
async function fetchUserEntitlements() {
  const url = `${getConfig().LMS_BASE_URL}/api/entitlements/v1/entitlements/`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

/**
 * TODO
 * @returns
 */
export default function makeUserEntitlementsQuery() {
  return {
    queryKey: enterpriseQueryKeys.entitlements,
    queryFn: fetchUserEntitlements,
  };
}
