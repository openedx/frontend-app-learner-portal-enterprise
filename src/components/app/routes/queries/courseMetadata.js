import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getErrorResponseStatusCode } from '../../../../utils/common';
import { enterpriseQueryKeys } from '../../../../utils/react-query-factory';

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
 * @param enterpriseUuid
 * @param {*} courseKey
 * @returns
 */
export default function makeCourseMetadataQuery(enterpriseUuid, courseKey) {
  return {
    queryKey: enterpriseQueryKeys.enterpriseCourseMetadata(enterpriseUuid, courseKey),
    queryFn: async () => fetchCourseMetadata(enterpriseUuid, courseKey),
    enabled: !!enterpriseUuid,
  };
}
