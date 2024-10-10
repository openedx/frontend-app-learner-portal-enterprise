import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import dayjs from 'dayjs';
import { generatePath, matchPath, redirect } from 'react-router-dom';
import { features } from '../../../../../config';
import { LICENSE_STATUS } from '../../../../enterprise-user-subsidy/data/constants';
import { fetchPaginatedData } from '../utils';

// Subscriptions

/**
 * TODO
 * @param {*} activationKey
 * @returns
 */
export async function activateLicense(activationKey) {
  const queryParams = new URLSearchParams({ activation_key: activationKey });
  const url = `${getConfig().LICENSE_MANAGER_URL}/api/v1/license-activation/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().post(url);
}

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export async function activateSubscriptionLicense({
  enterpriseCustomer,
  subscriptionLicenseToActivate,
  licenseActivationRouteMatch,
  dashboardRedirectPath,
  queryClient,
  subscriptionsQuery,
}) {
  try {
    // Activate the user's assigned subscription license.
    await activateLicense(subscriptionLicenseToActivate.activationKey);
    const autoActivatedSubscriptionLicense = {
      ...subscriptionLicenseToActivate,
      status: 'activated',
      activationDate: dayjs().toISOString(),
    };
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.license-activation.license-activated',
      {
        // `autoActivated` is true if the user is on a page route *other* than the license activation route.
        autoActivated: !licenseActivationRouteMatch,
      },
    );
    // If user is on the license activation route, redirect to the dashboard.
    if (licenseActivationRouteMatch) {
      queryClient.setQueryData(subscriptionsQuery.queryKey, {
        ...queryClient.getQueryData(subscriptionsQuery.queryKey),
        shouldShowActivationSuccessMessage: true,
      });
      throw redirect(dashboardRedirectPath);
    }
    // Otherwise, return the now-activated subscription license.
    return autoActivatedSubscriptionLicense;
  } catch (error) {
    logError(error);
    if (licenseActivationRouteMatch) {
      throw redirect(dashboardRedirectPath);
    }
    return null;
  }
}

/**
 * Attempts to auto-apply a license for the authenticated user and the specified customer agreement.
 *
 * @param {string} customerAgreementId The UUID of the customer agreement.
 * @returns An object representing the auto-applied license or null if no license was auto-applied.
 */
export async function requestAutoAppliedUserLicense(customerAgreementId) {
  const url = `${getConfig().LICENSE_MANAGER_URL}/api/v1/customer-agreement/${customerAgreementId}/auto-apply/`;
  const response = await getAuthenticatedHttpClient().post(url);
  return camelCaseObject(response.data);
}

/**
 * TODO
 * @param {*} param0
 */
export async function getAutoAppliedSubscriptionLicense({
  enterpriseCustomer,
  customerAgreement,
}) {
  // If the feature flag for auto-applied licenses is not enabled, return early.
  if (!features.ENABLE_AUTO_APPLIED_LICENSES) {
    return null;
  }

  const hasSubscriptionForAutoAppliedLicenses = !!customerAgreement.subscriptionForAutoAppliedLicenses;
  const hasIdentityProvider = enterpriseCustomer.identityProvider;
  const hasAutoAppliedWithUniversalLink = !!customerAgreement.enableAutoAppliedSubscriptionsWithUniversalLink;
  const hasIdpOrAutoAppliedWithUniversalLink = hasIdentityProvider || hasAutoAppliedWithUniversalLink;

  // If customer agreement has no configured subscription plan for auto-applied
  // licenses, or the enterprise customer does not have either a identity provider or
  // the field `enableAutoAppliedSubscriptionsWithUniversalLink` enabled
  // return early.
  if (!(hasSubscriptionForAutoAppliedLicenses && hasIdpOrAutoAppliedWithUniversalLink)) {
    return null;
  }

  try {
    return await requestAutoAppliedUserLicense(customerAgreement.uuid);
  } catch (error) {
    logError(error);
    return null;
  }
}

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export async function activateOrAutoApplySubscriptionLicense({
  enterpriseCustomer,
  allLinkedEnterpriseCustomerUsers,
  subscriptionsData,
  requestUrl,
  queryClient,
  subscriptionsQuery,
}) {
  const licenseActivationRouteMatch = matchPath('/:enterpriseSlug/licenses/:activationKey/activate', requestUrl.pathname);
  const dashboardRedirectPath = generatePath('/:enterpriseSlug', { enterpriseSlug: enterpriseCustomer.slug });

  const checkLicenseActivationRouteAndRedirectToDashboard = () => {
    if (!licenseActivationRouteMatch) {
      return null;
    }
    throw redirect(dashboardRedirectPath);
  };

  const {
    customerAgreement,
    licensesByStatus,
  } = subscriptionsData;
  // If there is no available customer agreement for the current customer,
  // or if there is no *current* plan available within such a customer agreement,
  // exit early and redirect to the dashboard.
  if (!customerAgreement || customerAgreement.netDaysUntilExpiration <= 0) {
    return checkLicenseActivationRouteAndRedirectToDashboard();
  }

  const isUserLinkedToEnterpriseCustomer = allLinkedEnterpriseCustomerUsers.some(
    (enterpriseCustomerUser) => enterpriseCustomerUser.enterpriseCustomer?.uuid === enterpriseCustomer.uuid,
  );
  const isCurrentSubscriptionLicenseFilter = (license) => license.subscriptionPlan.isCurrent;
  const filterLicenseStatus = (licenseStatusType) => licenseStatusType.filter(
    isCurrentSubscriptionLicenseFilter,
  ).length > 0;

  const hasActivatedSubscriptionLicense = filterLicenseStatus(licensesByStatus[LICENSE_STATUS.ACTIVATED]);
  const hasRevokedSubscriptionLicense = filterLicenseStatus(licensesByStatus[LICENSE_STATUS.REVOKED]);
  const subscriptionLicenseToActivate = licensesByStatus[LICENSE_STATUS.ASSIGNED].filter(
    isCurrentSubscriptionLicenseFilter,
  )[0];

  // Check if learner already has activated license. If so, return early.
  if (hasActivatedSubscriptionLicense) {
    return checkLicenseActivationRouteAndRedirectToDashboard();
  }

  // Otherwise, check if there is an assigned subscription license to
  // activate OR if the user should request an auto-applied subscription
  // license.
  let activatedOrAutoAppliedLicense = null;
  if (subscriptionLicenseToActivate) {
    activatedOrAutoAppliedLicense = await activateSubscriptionLicense({
      enterpriseCustomer,
      subscriptionLicenseToActivate,
      licenseActivationRouteMatch,
      dashboardRedirectPath,
      queryClient,
      subscriptionsQuery,
    });
  } else if (!hasRevokedSubscriptionLicense && isUserLinkedToEnterpriseCustomer) {
    activatedOrAutoAppliedLicense = await getAutoAppliedSubscriptionLicense({
      enterpriseCustomer,
      customerAgreement,
    });
  }
  if (activatedOrAutoAppliedLicense) {
    checkLicenseActivationRouteAndRedirectToDashboard();
  }
  return activatedOrAutoAppliedLicense;
}

export function transformSubscriptionsData(customerAgreement, subscriptionLicenses) {
  const licensesByStatus = {
    [LICENSE_STATUS.ACTIVATED]: [],
    [LICENSE_STATUS.ASSIGNED]: [],
    [LICENSE_STATUS.REVOKED]: [],
  };
  const subscriptionsData = {
    subscriptionLicenses,
    customerAgreement,
    subscriptionLicense: null,
    subscriptionPlan: null,
    licensesByStatus,
    showExpirationNotifications: false,
    shouldShowActivationSuccessMessage: false,
  };

  subscriptionsData.customerAgreement = customerAgreement;
  subscriptionsData.showExpirationNotifications = !(customerAgreement?.disableExpirationNotifications);

  // Sort licenses within each license status by whether the associated subscription plans
  // are current; current plans should be prioritized over non-current plans.
  const sortedSubscriptionLicenses = [...subscriptionLicenses].sort((a, b) => {
    const aIsCurrent = a.subscriptionPlan.isCurrent;
    const bIsCurrent = b.subscriptionPlan.isCurrent;
    if (aIsCurrent && bIsCurrent) { return 0; }
    return aIsCurrent ? -1 : 1;
  });
  subscriptionsData.subscriptionLicenses = sortedSubscriptionLicenses;

  // Group licenses by status.
  subscriptionLicenses.forEach((license) => {
    const { subscriptionPlan, status } = license;
    const isUnassignedLicense = status === LICENSE_STATUS.UNASSIGNED;
    if (isUnassignedLicense || !subscriptionPlan.isActive) {
      return;
    }
    licensesByStatus[license.status].push(license);
  });

  // Extracts a single subscription license for the user, from the ordered licenses by status.
  const applicableSubscriptionLicense = Object.values(licensesByStatus).flat()[0];
  if (applicableSubscriptionLicense) {
    subscriptionsData.subscriptionLicense = applicableSubscriptionLicense;
    subscriptionsData.subscriptionPlan = applicableSubscriptionLicense.subscriptionPlan;
  }
  subscriptionsData.licensesByStatus = licensesByStatus;

  return subscriptionsData;
}

/**
 * Fetches the subscription licenses for the specified enterprise customer.
 * @returns {Promise<Object>} The subscription licenses and related data.
 * @param enterpriseUUID
 */
export async function fetchSubscriptions(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    include_revoked: true,
    current_plans_only: false,
  });
  const url = `${getConfig().LICENSE_MANAGER_URL}/api/v1/learner-licenses/?${queryParams.toString()}`;
  /**
   * Ordering of these status keys (i.e., activated, assigned, revoked) is important as the first
   * license found when iterating through each status key in this order will be selected as the
   * applicable license for use by the rest of the application.
   *
   * Example: an activated license will be chosen as the applicable license because activated licenses
   * come first in ``licensesByStatus`` even if the user also has a revoked license.
   */
  try {
    const {
      results: subscriptionLicenses,
      response,
    } = await fetchPaginatedData(url);
    const { customerAgreement } = response;

    const transformedSubscriptionsData = transformSubscriptionsData(customerAgreement, subscriptionLicenses);
    return transformedSubscriptionsData;
  } catch (error) {
    logError(error);
    const emptySubscriptionsData = {
      subscriptionLicenses: [],
      customerAgreement: null,
      subscriptionLicense: null,
      subscriptionPlan: null,
      licensesByStatus: {
        [LICENSE_STATUS.ACTIVATED]: [],
        [LICENSE_STATUS.ASSIGNED]: [],
        [LICENSE_STATUS.REVOKED]: [],
      },
      showExpirationNotifications: false,
      shouldShowActivationSuccessMessage: false,
    };
    return emptySubscriptionsData;
  }
}
