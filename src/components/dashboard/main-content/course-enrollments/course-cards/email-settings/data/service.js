import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

// eslint-disable-next-line import/prefer-default-export
export const updateEmailSettings = (courseRunId, hasEmailsEnabled) => {
  const config = getConfig();
  const queryParams = new URLSearchParams({
    course_id: courseRunId,
  });
  if (hasEmailsEnabled) {
    // If emails are enabled, the API endpoint expects the string "on";
    // otherwise, the `receive_emails` field should be omitted.
    queryParams.set('receive_emails', 'on');
  }
  // NOTE: this request url cannot use a trailing slash since it causes a 404
  const emailSettingsUrl = `${config.LMS_BASE_URL}/api/change_email_settings`;
  return getAuthenticatedHttpClient().post(
    emailSettingsUrl,
    queryParams.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
};
