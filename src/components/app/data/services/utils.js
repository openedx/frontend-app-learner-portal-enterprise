import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/**
 * Recursive function to fetch all results, traversing a paginated API response. The
 * response and the list of results are already camelCased.
 *
 * @param {string} url Request URL
 * @param {Array} [results] Array of results.
 * @returns Array of all results for authenticated user.
 */
export async function fetchPaginatedData(url, results = []) {
  const response = await getAuthenticatedHttpClient().get(url);
  const responseData = camelCaseObject(response.data);
  const resultsCopy = [...results];
  resultsCopy.push(...responseData.results);
  if (responseData.next) {
    return fetchPaginatedData(responseData.next, resultsCopy);
  }
  return {
    results: resultsCopy,
    response: responseData,
  };
}
