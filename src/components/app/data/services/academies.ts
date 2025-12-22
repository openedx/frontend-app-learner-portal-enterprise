import type { AxiosResponse } from 'axios';
import { CamelCasedPropertiesDeep } from 'type-fest';
import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getLocale } from '@edx/frontend-platform/i18n';
import { fetchPaginatedData } from './utils';

// Supported languages for academy translations
const SUPPORTED_LANGUAGES = ['en', 'es'] as const;

/**
 * Get the current locale, falling back to English if unsupported
 * @returns A supported language code ('en' or 'es')
 */
const getSupportedLocale = (): string => {
  const currentLocale = getLocale();
  const baseLocale = currentLocale.split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGES.includes(baseLocale as any) ? baseLocale : 'en';
};

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
  const currentLocale = getSupportedLocale();
  const queryParams = new URLSearchParams({
    enterprise_customer: enterpriseUUID,
    lang: currentLocale,
    ...options,
  });
  const { ENTERPRISE_CATALOG_API_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies?${queryParams.toString()}`;

  const { results } = await fetchPaginatedData<AcademyRaw>(url);
  return results;
}

export async function fetchAcademiesDetail(academyUUID, enterpriseUUID, options = {}) {
  const currentLocale = getSupportedLocale();
  const queryParams = new URLSearchParams({
    enterprise_customer: enterpriseUUID,
    lang: currentLocale,
    ...options,
  });
  const { ENTERPRISE_CATALOG_API_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies/${academyUUID}/?${queryParams.toString()}`;
  const result: AxiosResponse<AcademyResponseRaw> = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(result.data) as Academy;
}
