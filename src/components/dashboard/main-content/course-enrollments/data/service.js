import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export const fetchEnterpriseCourseEnrollments = (uuid) => {
  const queryParams = new URLSearchParams({
    enterprise_id: uuid,
    is_active: true,
  });
  const url = `${getConfig().LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
};

export const acknowledgeContentAssignments = ({
  assignmentConfigurationId,
  assignmentIds,
}) => {
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/assignment-configurations/${assignmentConfigurationId}/acknowledge-assignments/`;
  return getAuthenticatedHttpClient().post(url, {
    assignment_uuids: assignmentIds,
  });
};
