import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import dayjs from 'dayjs';
import { generatePath, matchPath, redirect } from 'react-router-dom';
import { features } from '../../../../../config';
import { LICENSE_STATUS } from '../../../../enterprise-user-subsidy/data/constants';

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

  // If customer agreement has no configured subscription plan for auto-applied
  // licenses, or the enterprise customer does not have an identity provider,
  // return early.
  if (!hasSubscriptionForAutoAppliedLicenses || !hasIdentityProvider) {
    return null;
  }

  try {
    return requestAutoAppliedUserLicense(customerAgreement.uuid);
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
  subscriptionsData,
  requestUrl,
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
  if (!customerAgreement || customerAgreement.netDaysUntilExpiration <= 0) {
    return checkLicenseActivationRouteAndRedirectToDashboard();
  }

  // Check if learner already has activated license. If so, return early.
  const hasActivatedSubscriptionLicense = licensesByStatus[LICENSE_STATUS.ACTIVATED].length > 0;
  if (hasActivatedSubscriptionLicense) {
    return checkLicenseActivationRouteAndRedirectToDashboard();
  }

  // Otherwise, check if there is an assigned subscription license to
  // activate OR if the user should request an auto-applied subscription
  // license.
  let activatedOrAutoAppliedLicense = null;
  const subscriptionLicenseToActivate = licensesByStatus[LICENSE_STATUS.ASSIGNED][0];
  if (subscriptionLicenseToActivate) {
    activatedOrAutoAppliedLicense = await activateSubscriptionLicense({
      enterpriseCustomer,
      subscriptionLicenseToActivate,
      licenseActivationRouteMatch,
      dashboardRedirectPath,
    });
  }

  const hasRevokedSubscriptionLicense = licensesByStatus[LICENSE_STATUS.REVOKED].length > 0;
  if (!hasRevokedSubscriptionLicense) {
    activatedOrAutoAppliedLicense = await getAutoAppliedSubscriptionLicense({
      enterpriseCustomer,
      customerAgreement,
    });
  }

  checkLicenseActivationRouteAndRedirectToDashboard();

  return activatedOrAutoAppliedLicense;
}

/**
 * TODO
 * @returns
 * @param enterpriseUUID
 */
export async function fetchSubscriptions(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    include_revoked: true,
  });
  const url = `${getConfig().LICENSE_MANAGER_URL}/api/v1/learner-licenses/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  const {
    customerAgreement,
    results: subscriptionLicenses,
  } = camelCaseObject(response.data);
  const licensesByStatus = {
    [LICENSE_STATUS.ACTIVATED]: [],
    [LICENSE_STATUS.ASSIGNED]: [],
    [LICENSE_STATUS.REVOKED]: [],
  };
  const subscriptionsData = {
    subscriptionLicenses,
    customerAgreement,
    subscriptionLicense: null,
    licensesByStatus,
  };
  /**
   * Ordering of these status keys (i.e., activated, assigned, revoked) is important as the first
   * license found when iterating through each status key in this order will be selected as the
   * applicable license for use by the rest of the application.
   *
   * Example: an activated license will be chosen as the applicable license because activated licenses
   * come first in ``licensesByStatus`` even if the user also has a revoked license.
   */
  subscriptionLicenses.forEach((license) => {
    const { subscriptionPlan, status } = license;
    const { isActive, daysUntilExpiration } = subscriptionPlan;
    const isCurrent = daysUntilExpiration > 0;
    const isUnassignedLicense = status === LICENSE_STATUS.UNASSIGNED;
    if (isUnassignedLicense || !isCurrent || !isActive) {
      return;
    }
    licensesByStatus[license.status].push(license);
  });
  const applicableSubscriptionLicense = Object.values(licensesByStatus).flat()[0];
  subscriptionsData.subscriptionLicense = applicableSubscriptionLicense;
  subscriptionsData.licensesByStatus = licensesByStatus;

  return subscriptionsData;
}
