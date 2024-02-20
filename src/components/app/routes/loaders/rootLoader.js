import { defer, generatePath, redirect } from 'react-router-dom';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import ensureAuthenticatedUser from './ensureAuthenticatedUser';
import { ENTERPRISE_OFFER_STATUS, ENTERPRISE_OFFER_USAGE_TYPE } from '../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { SUBSIDY_REQUEST_STATE } from '../../../enterprise-subsidy-requests';

function fetchLicenseRequests({
  enterpriseUUID,
  userEmail,
  state = SUBSIDY_REQUEST_STATE.REQUESTED,
}) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    user__email: userEmail,
    state,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/license-requests/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}

function fetchCouponCodeRequests({
  enterpriseUUID,
  userEmail,
  state = SUBSIDY_REQUEST_STATE.REQUESTED,
}) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    user__email: userEmail,
    state,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/coupon-code-requests/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}

const fetchSubsidyRequestConfiguration = (enterpriseUUID) => {
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/customer-configurations/${enterpriseUUID}/`;
  return getAuthenticatedHttpClient().get(url);
};

const fetchEnterpriseOffers = (enterpriseId, options = {}) => {
  const queryParams = new URLSearchParams({
    usage_type: ENTERPRISE_OFFER_USAGE_TYPE.PERCENTAGE,
    discount_value: 100,
    status: ENTERPRISE_OFFER_STATUS.OPEN,
    page_size: 100,
    ...options,
  });
  const config = getConfig();
  const url = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/${enterpriseId}/enterprise-learner-offers/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
};

const fetchCouponCodeAssignments = (enterpriseId, options = {}) => {
  const queryParams = new URLSearchParams({
    enterprise_uuid: enterpriseId,
    full_discount_only: 'True', // Must be a string because the API does a string compare not a true JSON boolean compare.
    is_active: 'True',
    ...options,
  });
  const config = getConfig();
  const url = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/offer_assignment_summary/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
};

const fetchCouponsOverview = (enterpriseId, options = {}) => {
  const queryParams = new URLSearchParams({
    page: 1,
    page_size: 100,
    ...options,
  });
  const config = getConfig();
  const url = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/coupons/${enterpriseId}/overview/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
};

function fetchRedeemablePolicies(enterpriseUUID, userID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    lms_user_id: userID,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/credits_available/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}

function fetchSubscriptionLicensesForUser(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    include_revoked: true,
  });
  const config = getConfig();
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/learner-licenses/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}

function fetchCustomerAgreementData(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
  });
  const config = getConfig();
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/customer-agreement/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}

export const updateUserActiveEnterprise = async ({ enterpriseCustomer }) => {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise/select/active/`;
  const formData = new FormData();
  formData.append('enterprise', enterpriseCustomer.uuid);
  return getAuthenticatedHttpClient().post(url, formData);
};

async function fetchData(url, linkedEnterprises = []) {
  const response = await getAuthenticatedHttpClient().get(url);
  const responseData = camelCaseObject(response.data);
  const linkedEnterprisesCopy = [...linkedEnterprises];
  linkedEnterprisesCopy.push(...responseData.results);
  if (responseData.next) {
    return fetchData(responseData.next, linkedEnterprisesCopy);
  }
  return linkedEnterprisesCopy;
}

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const fetchEnterpriseLearnerData = async (username, options = {}) => {
  const config = getConfig();
  const enterpriseLearnerUrl = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-learner/`;
  const queryParams = new URLSearchParams({
    username,
    ...options,
    page: 1,
  });
  const url = `${enterpriseLearnerUrl}?${queryParams.toString()}`;
  const linkedEnterpriseCustomersUsers = await fetchData(url);
  const activeLinkedEnterpriseCustomerUser = linkedEnterpriseCustomersUsers.find(enterprise => enterprise.active);
  const activeEnterpriseCustomer = activeLinkedEnterpriseCustomerUser?.enterpriseCustomer;
  const activeEnterpriseCustomerUserRoleAssignments = activeLinkedEnterpriseCustomerUser?.roleAssignments;
  return {
    activeEnterpriseCustomer,
    activeEnterpriseCustomerUserRoleAssignments,
    allLinkedEnterpriseCustomerUsers: linkedEnterpriseCustomersUsers,
  };
};
export const makeEnterpriseLearnerQuery = (username) => ({
  queryKey: ['enterprise', 'linked-enterprise-customer-users', username],
  queryFn: async () => fetchEnterpriseLearnerData(username),
});

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const fetchSubscriptions = async (enterpriseUuid) => {
  const results = await Promise.all([
    fetchCustomerAgreementData(enterpriseUuid),
    fetchSubscriptionLicensesForUser(enterpriseUuid),
  ]);
  return {
    customerAgreement: results[0].data,
    subscriptionLicenses: results[1].data,
  };
};
export const makeSubscriptionsQuery = (enterpriseUuid) => ({
  queryKey: ['enterprise', 'subscriptions', enterpriseUuid],
  queryFn: async () => fetchSubscriptions(enterpriseUuid),
  enabled: !!enterpriseUuid,
});

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const fetchPolicies = async ({ enterpriseUuid, lmsUserId }) => ({
  redeemablePolicies: await fetchRedeemablePolicies(enterpriseUuid, lmsUserId),
});
export const makeRedeemablePoliciesQuery = ({ enterpriseUuid, lmsUserId }) => ({
  queryKey: ['enterprise', 'redeemable-policies', enterpriseUuid, lmsUserId],
  queryFn: async () => fetchPolicies({ enterpriseUuid, lmsUserId }),
  enabled: !!enterpriseUuid,
});

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const fetchCouponCodes = async (enterpriseUuid) => {
  const results = await Promise.all([
    fetchCouponsOverview(enterpriseUuid),
    fetchCouponCodeAssignments(enterpriseUuid),
  ]);
  return {
    couponsOverview: results[0].data,
    couponCodeAssignments: results[1].data,
  };
};
export const makeCouponCodesQuery = (enterpriseUuid) => ({
  queryKey: ['enterprise', 'coupon-codes', enterpriseUuid],
  queryFn: async () => fetchCouponCodes(enterpriseUuid),
  enabled: !!enterpriseUuid,
});

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const fetchEnterpriseLearnerOffers = async (enterpriseUuid) => ({
  enterpriseOffers: await fetchEnterpriseOffers(enterpriseUuid),
});
export const makeEnterpriseLearnerOffersQuery = (enterpriseUuid) => ({
  queryKey: ['enterprise', 'enterprise-learner-offers', enterpriseUuid],
  queryFn: async () => fetchEnterpriseLearnerOffers(enterpriseUuid),
  enabled: !!enterpriseUuid,
});

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const fetchBrowseAndRequestConfiguration = async (enterpriseUuid, userEmail) => {
  const results = await Promise.all([
    fetchSubsidyRequestConfiguration(enterpriseUuid),
    fetchCouponCodeRequests({
      enterpriseUUID: enterpriseUuid,
      userEmail,
    }),
    fetchLicenseRequests({
      enterpriseUUID: enterpriseUuid,
      userEmail,
    }),
  ]);
  return {
    subsidyRequestConfiguration: results[0].data,
    couponCodeRequests: results[1].data,
    licenseRequests: results[2].data,
  };
};
export const makeBrowseAndRequestConfigurationQuery = (enterpriseUuid, userEmail) => ({
  queryKey: ['enterprise', enterpriseUuid, 'browse-and-request-configuration', userEmail],
  queryFn: async () => fetchBrowseAndRequestConfiguration(enterpriseUuid, userEmail),
  enabled: !!enterpriseUuid,
});

/**
 * Content Highlights Configuration
 * @param {*} enterpriseUUID
 * @returns
 */
const fetchEnterpriseCuration = async (enterpriseUUID, options = {}) => {
  const queryParams = new URLSearchParams({
    enterprise_customer: enterpriseUUID,
    ...options,
  });
  const url = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-curations/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  const data = camelCaseObject(response.data);
  // Return first result, given that there should only be one result, if any.
  return data.results[0];
};
export const makeContentHighlightsConfigurationQuery = (enterpriseUUID) => ({
  queryKey: ['enterprise', enterpriseUUID, 'content-highlights', 'configuration'],
  queryFn: () => fetchEnterpriseCuration(enterpriseUUID),
  enabled: !!enterpriseUUID,
});

function getEnterpriseAppData({
  enterpriseCustomer,
  userId,
  userEmail,
  queryClient,
}) {
  return [
    // Enterprise Customer User Subsidies
    queryClient.fetchQuery(
      makeSubscriptionsQuery(enterpriseCustomer.uuid),
    ),
    queryClient.fetchQuery(
      makeRedeemablePoliciesQuery({
        enterpriseUuid: enterpriseCustomer.uuid,
        lmsUserId: userId,
      }),
    ),
    queryClient.fetchQuery(
      makeCouponCodesQuery(enterpriseCustomer.uuid),
    ),
    queryClient.fetchQuery(
      makeEnterpriseLearnerOffersQuery(enterpriseCustomer.uuid),
    ),
    queryClient.fetchQuery(
      makeBrowseAndRequestConfigurationQuery(enterpriseCustomer.uuid, userEmail),
    ),
    // Content Highlights
    // TODO: delete a content highlights configuration record and re-test.
    queryClient.fetchQuery(
      makeContentHighlightsConfigurationQuery(enterpriseCustomer.uuid),
    ),
  ];
}

/**
 * TODO
 * @param {*} queryClient
 * @returns
 */
export default function makeRootLoader(queryClient) {
  return async function rootLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl);
    const { username, userId, email: userEmail } = authenticatedUser;
    const { enterpriseSlug } = params;

    // Retrieve linked enterprise customers for the current user from query cache
    // or fetch from the server if not available.
    const linkedEnterpriseCustomersQuery = makeEnterpriseLearnerQuery(username);
    const enterpriseLearnerData = await queryClient.fetchQuery(linkedEnterpriseCustomersQuery);
    const {
      activeEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
    } = enterpriseLearnerData;

    // User has no active, linked enterprise customer; return no data.
    if (!activeEnterpriseCustomer) {
      return defer({ enterpriseAppData: null });
    }

    if (enterpriseSlug !== activeEnterpriseCustomer.slug) {
      const foundEnterpriseCustomerForSlug = allLinkedEnterpriseCustomerUsers.find(
        enterpriseCustomerUser => enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug,
      );
      if (foundEnterpriseCustomerForSlug) {
        await updateUserActiveEnterprise({
          enterpriseCustomer: foundEnterpriseCustomerForSlug.enterpriseCustomer,
        });
        queryClient.setQueryData(linkedEnterpriseCustomersQuery.queryKey, {
          activeEnterpriseCustomer: foundEnterpriseCustomerForSlug.enterpriseCustomer,
          activeEnterpriseCustomerUserRoleAssignments: foundEnterpriseCustomerForSlug.roleAssignments,
          allLinkedEnterpriseCustomerUsers: allLinkedEnterpriseCustomerUsers.map(
            enterpriseCustomerUser => ({
              ...enterpriseCustomerUser,
              active: enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug,
            }),
          ),
        });
        return defer({
          enterpriseAppData: Promise.all(getEnterpriseAppData({
            enterpriseCustomer: foundEnterpriseCustomerForSlug.enterpriseCustomer,
            userId,
            userEmail,
            queryClient,
          })),
        });
      }

      return redirect(generatePath('/:enterpriseSlug/*', {
        enterpriseSlug: activeEnterpriseCustomer.slug,
        '*': requestUrl.pathname.split('/').filter(pathPart => !!pathPart).slice(1).join('/'),
      }));
    }

    return defer({
      enterpriseAppData: Promise.all(getEnterpriseAppData({
        enterpriseCustomer: activeEnterpriseCustomer,
        userId,
        userEmail,
        queryClient,
      })),
    });
  };
}
