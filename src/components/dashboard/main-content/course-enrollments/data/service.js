/* eslint-disable import/prefer-default-export */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export const fetchEnterpriseCourseEnrollments = (uuid) => {
  const queryParams = new URLSearchParams({
    enterprise_id: uuid,
    is_active: true,
  });
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
};

export const fetchEnterpriseProgramEnrollments = (uuid) => {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/program-enrollment/user-enrollments/?enterprise_uuid=${uuid}`;
  return getAuthenticatedHttpClient().get(url);
};
