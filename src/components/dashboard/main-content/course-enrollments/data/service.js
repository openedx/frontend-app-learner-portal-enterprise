/* eslint-disable import/prefer-default-export */
import qs from 'query-string';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export const fetchEnterpriseCourseEnrollments = (uuid) => {
  const queryParams = {
    enterprise_id: uuid,
    is_active: true,
  };
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?${qs.stringify(queryParams)}`;
  return getAuthenticatedHttpClient().get(url);
};
