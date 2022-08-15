import { getConfig } from '@edx/frontend-platform/config';

/**
 * Returns a URL to the enterprise proxy login page in the LMS. The proxy-login page
 * appropriately redirects enterprise users to the enterprise-specific logistration flow.
 *
 * @returns URL of the enterprise proxy login page in the LMS.
 */
export const getLoginUrl = () => `${getConfig().LMS_BASE_URL}/iam/login`;
