import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getErrorResponseStatusCode } from '../../../../utils/common';

/**
 * Service method to determine whether the authenticated user can redeem the specified course run(s).
 *
 * @param {object} args
 * @param {array} courseRunKeys List of course run keys.
 * @returns Promise for get request from the authenticated http client.
 */
export const fetchCanRedeem = async (enterpriseId, courseRunKeys) => {
  const queryParams = new URLSearchParams();
  courseRunKeys.forEach((courseRunKey) => {
    queryParams.append('content_key', courseRunKey);
  });
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/enterprise-customer/${enterpriseId}/can-redeem/`;
  const urlWithParams = `${url}?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(urlWithParams);
    return camelCaseObject(response.data);
  } catch (error) {
    const errorResponseStatusCode = getErrorResponseStatusCode(error);
    if (errorResponseStatusCode === 404) {
      return [];
    }
    throw error;
  }
};

/**
 * TODO
 * @param enterpriseUuid
 * @param {*} courseMetadata
 * @returns
 */
// export default function makeCanRedeemQuery(enterpriseUuid, courseMetadata) {
//   const availableCourseRunKeys = getAvailableCourseRuns(courseMetadata).map(courseRun => courseRun.key);
//   return {
//     queryKey: enterpriseQueryKeys.canRedeem(enterpriseUuid, availableCourseRunKeys),
//     queryFn: async () => fetchCanRedeem(enterpriseUuid, availableCourseRunKeys),
//     enabled: !!enterpriseUuid && availableCourseRunKeys.length > 0,
//   };
// }
