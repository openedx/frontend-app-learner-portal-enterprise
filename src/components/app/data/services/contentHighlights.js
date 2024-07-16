import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';

import { MAX_HIGHLIGHT_SETS } from '../constants';
import { fetchPaginatedData } from './utils';

/**
 * Content Highlights Configuration
 * @param {*} enterpriseUUID
 * @param options
 * @returns
 */
export async function fetchEnterpriseCuration(enterpriseUUID, options = {}) {
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
    logError(error);
    return null;
  }
}

/** Content Highlights Sets
 *
 * @param enterpriseUUID
 * @param options
 * @returns
 */
export async function fetchContentHighlights(enterpriseUUID, options = {}) {
  const queryParams = new URLSearchParams({
    enterprise_customer: enterpriseUUID,
    page_size: MAX_HIGHLIGHT_SETS,
    ...options,
  });
  const url = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/highlight-sets/?${queryParams.toString()}`;
  try {
    const { results } = await fetchPaginatedData(url);
    return results;
  } catch (error) {
    logError(error);
    return [];
  }
}
