import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

export const baseLearnerBFFResponse = {
  enterpriseCustomerUserSubsidies: {
    subscriptions: {
      customerAgreement: {},
      subscriptionLicenses: [],
      subscriptionLicensesByStatus: {},
    },
  },
  errors: [],
  warnings: [],
};

export const learnerDashboardBFFResponse = {
  ...baseLearnerBFFResponse,
  enterpriseCourseEnrollments: [],
};

export async function fetchEnterpriseLearnerDashboard(customerIdentifiers) {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/learner/dashboard/`;
  try {
    const params = {
      enterprise_customer_uuid: customerIdentifiers?.enterpriseId,
      enterprise_customer_slug: customerIdentifiers?.enterpriseSlug,
    };

    const result = await getAuthenticatedHttpClient().post(url, params);
    return camelCaseObject(result.data);
  } catch (error) {
    logError(error);
    return learnerDashboardBFFResponse;
  }
}
