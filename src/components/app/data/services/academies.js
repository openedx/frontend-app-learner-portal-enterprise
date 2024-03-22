import { getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { fetchPaginatedData } from './utils';
import { getErrorResponseStatusCode } from '../../../../utils/common';

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
    if (getErrorResponseStatusCode(error) !== 404) {
      logError(error);
    }
    return [];
  }
}
