import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getErrorResponseStatusCode } from '../../../../utils/common';

/**
 * Content Highlights Configuration
 * @param {*} enterpriseUUID
 * @returns
 */
export const fetchEnterpriseCuration = async (enterpriseUUID, options = {}) => {
  const queryParams = new URLSearchParams({
    enterprise_customer: enterpriseUUID,
    ...options,
  });
  const url = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-curations/?${queryParams.toString()}`;

  try {
    const response = await getAuthenticatedHttpClient().get(url);
    const data = camelCaseObject(response.data);
    // Return first result, given that there should only be one result, if any.
    return data.results[0] ?? null;
  } catch (error) {
    const errorResponseStatusCode = getErrorResponseStatusCode(error);
    if (errorResponseStatusCode === 404) {
      return null;
    }
    throw error;
  }
};
