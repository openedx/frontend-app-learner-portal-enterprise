import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export function postLinkEnterpriseLearner(inviteKeyUUID) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer-invite-key/${inviteKeyUUID}/link-user/`;
  return getAuthenticatedHttpClient().post(url);
}
