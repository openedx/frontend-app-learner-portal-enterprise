import dayjs from 'dayjs';

import { POLICY_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';

/**
 * Check if system maintenance alert is open, based on configuration.
 * @param {Object} config
 * @returns {boolean}
 */
export function isSystemMaintenanceAlertOpen(config) {
  if (!config) {
    return false;
  }
  const isEnabledWithMessage = (
    config.IS_MAINTENANCE_ALERT_ENABLED && config.MAINTENANCE_ALERT_MESSAGE
  );
  if (!isEnabledWithMessage) {
    return false;
  }
  const startTimestamp = config.MAINTENANCE_ALERT_START_TIMESTAMP;

  // Given no start timestamp, the system maintenance alert should be open, as
  // it's enabled and has a message.
  if (!startTimestamp) {
    return true;
  }

  // Otherwise, check whether today's date is after the defined start date.
  return dayjs().isAfter(dayjs(startTimestamp));
}

/**
 * Determine whether learner has only content assignments available to them, based on the presence of:
 * - content assignments for display (allocated or canceled)
 * - no auto-applied budgets
 * - no current enterprise offers
 * - no active license or license requests
 * - no assigned codes or code requests
 *
 * @param {Object} params - The parameters object.
 * @param {Object} params.subscriptionPlan - The subscription plan of the learner.
 * @param {Object} params.subscriptionLicense - The subscription license of the learner.
 * @param {Array} params.licenseRequests - The license requests of the learner.
 * @param {number} params.couponCodesCount - The count of assigned coupon codes of the learner.
 * @param {Array} params.couponCodeRequests - The coupon code requests of the learner.
 * @param {Object} params.redeemableLearnerCreditPolicies - The redeemable learner credit policies.
 * @param {boolean} params.hasCurrentEnterpriseOffers - Whether the learner has current enterprise offers.
 * @returns {boolean} - Returns true if the learner has only content assignments available to them, false otherwise.
 */
export function determineLearnerHasContentAssignmentsOnly({
  subscriptionPlan,
  subscriptionLicense,
  licenseRequests,
  couponCodesCount,
  couponCodeRequests,
  redeemableLearnerCreditPolicies,
  hasCurrentEnterpriseOffers,
}) {
  const hasActiveLicense = !!(subscriptionPlan?.isActive && subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED);
  const hasActiveLicenseOrLicenseRequest = hasActiveLicense || licenseRequests.length > 0;
  const hasAssignedCodesOrCodeRequests = couponCodesCount > 0 || couponCodeRequests.length > 0;
  const autoAppliedPolicyTypes = [
    POLICY_TYPES.PER_LEARNER_CREDIT,
    POLICY_TYPES.PER_ENROLLMENT_CREDIT,
  ];
  const hasAutoAppliedLearnerCreditPolicies = !!redeemableLearnerCreditPolicies.redeemablePolicies.filter(
    policy => autoAppliedPolicyTypes.includes(policy.policyType),
  ).length > 0;
  const hasAllocatedOrAcceptedAssignments = !!(
    redeemableLearnerCreditPolicies.learnerContentAssignments.hasAllocatedAssignments
    || redeemableLearnerCreditPolicies.learnerContentAssignments.hasAcceptedAssignments
  );

  return (
    hasAllocatedOrAcceptedAssignments
    && !hasCurrentEnterpriseOffers
    && !hasActiveLicenseOrLicenseRequest
    && !hasAssignedCodesOrCodeRequests
    && !hasAutoAppliedLearnerCreditPolicies
  );
}
