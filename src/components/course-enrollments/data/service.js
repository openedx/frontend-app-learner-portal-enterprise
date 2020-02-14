/* eslint-disable import/prefer-default-export */
import qs from 'query-string';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const fetchEnterpriseCourseEnrollments = (enterpriseUUID) => {
  const queryParams = {
    enterprise_id: enterpriseUUID,
  };
  const url = `${process.env.LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?${qs.stringify(queryParams)}`;
  return getAuthenticatedHttpClient().get(url);
};
