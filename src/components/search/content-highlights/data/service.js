import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export const getContentHighlights = () => {
  const url = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/highlight-sets/`;
  return getAuthenticatedHttpClient().get(url);
};
