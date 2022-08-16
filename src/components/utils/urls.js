import { getConfig } from '@edx/frontend-platform/config';

/**
 * Given either an `enterpriseSlug` or an `enterpriseCustomerInviteKey`, returns a
 * URL to the dojo-auth-mfe. This is enterprise specific and aware
 *
 * @param {string} enterpriseSlug Slug of an enterprise customer
 * @param {string} enterpriseCustomerInviteKey UUID of an EnterpriseCustomerInviteKey
 * @returns URL of the enterprise proxy login page in the LMS.
 */
// eslint-disable-next-line import/prefer-default-export
export const getLoginUrl = (enterpriseSlug, enterpriseCustomerInviteKey) => {
  const loginUrl = new URL(`${getConfig().LMS_BASE_URL}/iam/login/`);
  const queryParams = new URLSearchParams();

  queryParams.append('next', global.location);

  if (enterpriseSlug) {
    queryParams.append('enterprise_slug', enterpriseSlug);

    // append enterpriseSlug as a subdomain if it is not already there
    if (loginUrl.hostname.split('.')[0] !== enterpriseSlug) {
      loginUrl.hostname = `${enterpriseSlug}.${loginUrl.hostname}`;
    }
  }

  if (enterpriseCustomerInviteKey) {
    queryParams.append('enterprise_customer_invite_key', enterpriseCustomerInviteKey);
  }

  return loginUrl.href;
};
