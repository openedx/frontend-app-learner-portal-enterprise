import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/**
 * TODO
 * @param {*} enterpriseId
 * @param {*} options
 * @returns
 */
export const fetchEnterpriseCourseEnrollments = async (enterpriseId, options = {}) => {
  const queryParams = new URLSearchParams({
    enterprise_id: enterpriseId,
    ...options,
  });
  const url = `${getConfig().LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
};

/**
 * TODO
 * @returns
 * @param enterpriseUuid
 */
// export default function makeEnterpriseCourseEnrollmentsQuery(enterpriseUuid) {
//   return {
//     queryKey: enterpriseQueryKeys.enterpriseCourseEnrollments(enterpriseUuid),
//     queryFn: async () => fetchEnterpriseCourseEnrollments(enterpriseUuid),
//     enabled: !!enterpriseUuid,
//   };
// }
