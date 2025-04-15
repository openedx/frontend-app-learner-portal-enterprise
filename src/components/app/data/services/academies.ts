import type { AxiosResponse } from 'axios';
import { CamelCasedPropertiesDeep } from 'type-fest';
import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { fetchPaginatedData } from './utils';

type AcademyRaw = {
  uuid: string;
  [key: string]: unknown;
};
type AcademyResponseRaw = AxiosResponse<AcademyRaw>;
type AcademyResponse = CamelCasedPropertiesDeep<AcademyResponseRaw>;
type Academy = AcademyResponse['data'];

export async function fetchAcademies(
  enterpriseUUID: string,
  options: Record<string, string> = {},
) {
  const queryParams = new URLSearchParams({
    enterprise_customer: enterpriseUUID,
    ...options,
  });
  const { ENTERPRISE_CATALOG_API_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies?${queryParams.toString()}`;

  const { results } = await fetchPaginatedData<AcademyRaw>(url);
  return results;
}

export async function fetchAcademiesDetail(academyUUID, enterpriseUUID, options = {}) {
  const queryParams = new URLSearchParams({
    enterprise_customer: enterpriseUUID,
    ...options,
  });
  const { ENTERPRISE_CATALOG_API_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies/${academyUUID}/?${queryParams.toString()}`;
  const result: AxiosResponse<AcademyResponseRaw> = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(result.data) as Academy;
}
