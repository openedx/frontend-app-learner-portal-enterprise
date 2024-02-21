import { defer } from 'react-router-dom';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import ensureAuthenticatedUser from './ensureAuthenticatedUser';
import { makeEnterpriseLearnerQuery } from './rootLoader';
import { getAvailableCourseRuns } from '../../../course/data/utils';
import { getErrorResponseStatusCode } from '../../../../utils/common';

/**
 * Service method to determine whether the authenticated user can redeem the specified course run(s).
 *
 * @param {object} args
 * @param {array} courseRunKeys List of course run keys.
 * @returns Promise for get request from the authenticated http client.
 */
const fetchCanRedeem = async (enterpriseId, courseRunKeys) => {
  const queryParams = new URLSearchParams();
  courseRunKeys.forEach((courseRunKey) => {
    queryParams.append('content_key', courseRunKey);
  });
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/enterprise-customer/${enterpriseId}/can-redeem/`;
  const urlWithParams = `${url}?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(urlWithParams);
    return camelCaseObject(response.data);
  } catch (error) {
    const errorResponseStatusCode = getErrorResponseStatusCode(error);
    if (errorResponseStatusCode === 404) {
      return [];
    }
    throw error;
  }
};
export const makeCanRedeemQuery = (enterpriseId, courseMetadata) => {
  const availableCourseRunKeys = getAvailableCourseRuns(courseMetadata).map(courseRun => courseRun.key);
  return {
    queryKey: ['enterprise', 'course', 'can-redeem', enterpriseId, availableCourseRunKeys],
    queryFn: async () => fetchCanRedeem(enterpriseId, availableCourseRunKeys),
    enabled: !!enterpriseId && availableCourseRunKeys.length > 0,
  };
};

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const fetchCourseMetadata = async (enterpriseId, courseKey, options = {}) => {
  const contentMetadataUrl = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${enterpriseId}/content-metadata/${courseKey}/`;
  const queryParams = new URLSearchParams({
    ...options,
  });
  const url = `${contentMetadataUrl}?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    const errorResponseStatusCode = getErrorResponseStatusCode(error);
    if (errorResponseStatusCode === 404) {
      return null;
    }
    throw error;
  }
};
export const makeCourseMetadataQuery = (enterpriseId, courseKey) => ({
  queryKey: ['enterprise', enterpriseId, 'course', courseKey],
  queryFn: async () => fetchCourseMetadata(enterpriseId, courseKey),
  enabled: !!enterpriseId,
});

const fetchEnterpriseCourseEnrollments = async (enterpriseId, options = {}) => {
  const queryParams = new URLSearchParams({
    enterprise_id: enterpriseId,
    ...options,
  });
  const url = `${getConfig().LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
};
export const makeEnterpriseCourseEnrollmentsQuery = (enterpriseId) => ({
  queryKey: ['enterprise', enterpriseId, 'enrollments'],
  queryFn: async () => fetchEnterpriseCourseEnrollments(enterpriseId),
  enabled: !!enterpriseId,
});

async function fetchUserEntitlements() {
  const url = `${getConfig().LMS_BASE_URL}/api/entitlements/v1/entitlements/`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}
export const makeUserEntitlementsQuery = () => ({
  queryKey: ['user', 'entitlements'],
  queryFn: fetchUserEntitlements,
});

export async function extractActiveEnterpriseId({
  queryClient,
  authenticatedUser,
  enterpriseSlug,
}) {
  // Retrieve linked enterprise customers for the current user from query cache
  // or fetch from the server if not available.
  const linkedEnterpriseCustomersQuery = makeEnterpriseLearnerQuery(authenticatedUser.username);
  const enterpriseLearnerData = await queryClient.fetchQuery(linkedEnterpriseCustomersQuery);
  const {
    activeEnterpriseCustomer,
    allLinkedEnterpriseCustomerUsers,
  } = enterpriseLearnerData;

  if (!enterpriseSlug) {
    return activeEnterpriseCustomer.uuid;
  }

  const foundEnterpriseIdForSlug = allLinkedEnterpriseCustomerUsers.find(
    (enterprise) => enterprise.enterpriseCustomer.slug === enterpriseSlug,
  )?.enterpriseCustomer.uuid;

  if (foundEnterpriseIdForSlug) {
    return foundEnterpriseIdForSlug;
  }

  throw new Error(`Could not find enterprise customer for user ${authenticatedUser.userId} and slug ${enterpriseSlug}`);
}

/**
 * TODO
 * @param {*} queryClient
 * @returns
 */
export default function makeCourseLoader(queryClient) {
  return async function courseLoader({ params = {} }) {
    const authenticatedUser = await ensureAuthenticatedUser();
    const { courseKey, enterpriseSlug } = params;

    const enterpriseId = await extractActiveEnterpriseId({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    // Seed the requisite metadata for the course page, including:
    // - course run metadata (awaited)
    // - enterprise course enrollments
    // - user entitlements
    // - whether the enterprise customer contains the specified content
    return defer({
      courseMetadata: Promise.all([
        queryClient.fetchQuery(makeCourseMetadataQuery(enterpriseId, courseKey)),
      ]),
      enterpriseCourseEnrollments: Promise.all([
        queryClient.fetchQuery(makeEnterpriseCourseEnrollmentsQuery(enterpriseId)),
        queryClient.fetchQuery(makeUserEntitlementsQuery()),
      ]),
    });
  };
}

export function makeCanRedeemCourseLoader(queryClient) {
  return async function canRedeemCourseLoader({ params = {} }) {
    const authenticatedUser = await ensureAuthenticatedUser();
    const { courseKey, enterpriseSlug } = params;

    const enterpriseId = await extractActiveEnterpriseId({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    const contentMetadataQuery = makeCourseMetadataQuery(enterpriseId, courseKey);
    const courseMetadata = await queryClient.fetchQuery(contentMetadataQuery);

    if (!courseMetadata) {
      return null;
    }

    // Seed the can redeem query.
    return defer({
      canRedeem: queryClient.fetchQuery(
        makeCanRedeemQuery(enterpriseId, courseMetadata),
      ),
    });
  };
}
