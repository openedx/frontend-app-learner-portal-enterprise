import { getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { transformGroupMembership, transformPolicies } from '../utils';
import { fetchPaginatedData } from './utils';

export async function fetchEnterpriseAccessPolicies(enterpriseUuid) {
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/subsidy-access-policies/?enterprise_customer_uuid=${enterpriseUuid}`;
  try {
    const { results } = await fetchPaginatedData(url);
    return results;
  } catch (error) {
    logError(error);
    return null;
  }
}

export async function fetchEnterpriseCatalogContentMetadata(catalogUuid) {
  const url = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-catalogs/${catalogUuid}/get_content_metadata`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    const data = camelCaseObject(response.data);
    return data;
  } catch (error) {
    logError(error);
    return null;
  }
}

// Helper function to loop through all the subsidies and get the group associations
const retrievePolicyGroupAssociations = async (enterpriseUuid) => {
  const enterpriseAccessPolicies = await fetchEnterpriseAccessPolicies(enterpriseUuid);
  const policyGroupAssociations = transformPolicies(enterpriseAccessPolicies);
  return policyGroupAssociations;
};

export async function fetchEnterpriseGroupMemberships(enterpriseUuid, userEmail) {
  const enterpriseCustomerGroups = await retrievePolicyGroupAssociations(enterpriseUuid);
  const enterpriseGroupMemberships = await Promise.all(enterpriseCustomerGroups.map(async (enterpriseGroup) => {
    const { groupUuid } = enterpriseGroup;
    const url = `${getConfig().LMS_BASE_URL}/enterprise/api/v1/enterprise-group/${groupUuid}/learners/`;
    try {
      const { results } = await fetchPaginatedData(url);
      const { catalogUuid } = enterpriseGroup;
      const catalogContentMetadata = await fetchEnterpriseCatalogContentMetadata(catalogUuid);
      const transformedData = transformGroupMembership(results, groupUuid, catalogUuid, catalogContentMetadata);
      return transformedData;
    } catch (error) {
      logError(error);
      return null;
    }
  }));
  // Filter list of learners to get memberships for the user
  const learnerEnterpriseGroupMemberships = enterpriseGroupMemberships
    .flatMap(enterpriseGroupMembership => enterpriseGroupMembership
      .filter(learner => learner.memberDetails.userEmail === userEmail));
  return learnerEnterpriseGroupMemberships;
}
