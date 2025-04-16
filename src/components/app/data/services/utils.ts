import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type { AxiosResponse } from 'axios';
import { CamelCasedPropertiesDeep } from 'type-fest';

type PaginatedAxiosResponseRaw<T = unknown, R = unknown> = AxiosResponse<Paginated<T> & R>;
type PaginatedAxiosResponse<T = unknown, R = unknown> = CamelCasedPropertiesDeep<PaginatedAxiosResponseRaw<T, R>>;
type PaginatedAxiosResponseData<T = unknown, R = unknown> = PaginatedAxiosResponse<T, R>['data'];

/**
 * Recursive function to fetch all results, traversing a paginated API response. The
 * response and the list of results are already camelCased.
 *
 * @param {string} url Request URL
 * @param {Array} [results] Array of results.
 * @returns Array of all results for authenticated user.
 */
export async function fetchPaginatedData<RawItem = unknown, ExtraResponseAttrs = unknown>(
  url: string,
  results: CamelCasedPropertiesDeep<RawItem>[] = [],
) {
  const response: PaginatedAxiosResponse<RawItem, ExtraResponseAttrs> = await getAuthenticatedHttpClient().get(url);
  const responseData: PaginatedAxiosResponseData<RawItem, ExtraResponseAttrs> = camelCaseObject(response.data);
  const combinedResults: CamelCasedPropertiesDeep<RawItem>[] = [
    ...results,
    ...responseData.results,
  ];

  if (responseData.next) {
    return fetchPaginatedData<RawItem>(responseData.next, combinedResults);
  }

  return {
    results: combinedResults,
    response: responseData,
  };
}
