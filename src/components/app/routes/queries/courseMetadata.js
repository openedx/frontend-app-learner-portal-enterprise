import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getErrorResponseStatusCode } from '../../../../utils/common';

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const fetchCourseMetadata = async (enterpriseId, courseKey, options = {}) => {
  const contentMetadataUrl = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${enterpriseId}/content-metadata/${courseKey}/`;
  const queryParams = new URLSearchParams({
    ...options,
  });
  const url = `${contentMetadataUrl}?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    const errorResponseStatusCode = getErrorResponseStatusCode(error);
    if (errorResponseStatusCode === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * TODO
 * @param {*} enterpriseId
 * @param {*} courseKey
 * @returns
 */
export default function makeCourseMetadataQuery(enterpriseId, courseKey) {
  return {
    queryKey: ['enterprise', enterpriseId, 'course', courseKey],
    queryFn: async () => fetchCourseMetadata(enterpriseId, courseKey),
    enabled: !!enterpriseId,
  };
}
