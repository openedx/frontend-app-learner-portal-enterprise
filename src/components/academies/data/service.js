import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

export async function getAcademyMetadata(academyUUID) {
  const config = getConfig();
  const url = `${config.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies/${academyUUID}/`;
  const result = await getAuthenticatedHttpClient().get(url);
  const metadata = camelCaseObject(result.data);
  return metadata;
}

export async function getAcademies(enterpriseCustomerUUID) {
  const url = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies/?enterprise_customer=${enterpriseCustomerUUID}`;
  const result = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(result?.data?.results || []);
}
