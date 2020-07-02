import qs from 'query-string';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const updateEmailSettings = (courseRunId, hasEmailsEnabled) => {
  const queryParams = {
    course_id: courseRunId,
    // If emails are enabled, the API endpoint expects the string "on";
    // otherwise, the `receive_emails` field should be omitted.
    receive_emails: hasEmailsEnabled ? 'on' : undefined,
  };
  // NOTE: this request url cannot use a trailing slash since it causes a 404
  const emailSettingsUrl = `${process.env.LMS_BASE_URL}/change_email_settings`;
  return getAuthenticatedHttpClient().post(
    emailSettingsUrl,
    qs.stringify(queryParams),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
};

// eslint-disable-next-line import/prefer-default-export
export { updateEmailSettings };
