import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/**
 * TODO
 * @param {*} enterpriseId
 * @param {*} options
 * @returns
 */
const fetchEnterpriseCourseEnrollments = async (enterpriseId, options = {}) => {
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
 * @param {*} enterpriseId
 * @returns
 */
export default function makeEnterpriseCourseEnrollmentsQuery(enterpriseId) {
  return {
    queryKey: ['enterprise', enterpriseId, 'enrollments'],
    queryFn: async () => fetchEnterpriseCourseEnrollments(enterpriseId),
    enabled: !!enterpriseId,
  };
}
