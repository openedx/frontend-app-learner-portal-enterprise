import { getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { fetchPaginatedData } from './utils';

export async function fetchAcademies(enterpriseUUID, options = {}) {
  const queryParams = new URLSearchParams({
    enterprise_customer: enterpriseUUID,
    ...options,
  });

  const url = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies?${queryParams.toString()}`;

  try {
    const { results } = await fetchPaginatedData(url);
    return results;
  } catch (error) {
    logError(error);
    return [];
  }
}

export async function fetchAcademiesDetail(academyUUID) {
  const config = getConfig();
  const url = `${config.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies/${academyUUID}/`;
  try {
    const result = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(result.data);
  } catch (error) {
    logError(error);
    return null;
  }
}
