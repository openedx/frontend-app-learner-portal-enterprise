import { POLICY_TYPES } from '../enterprise-offers/data/constants';
import { LICENSE_STATUS } from './constants';

/**
 * Transforms the redeemable policies data by attaching the subsidy expiration date
 * to each assignment within the policies, if available.
 * @param {object[]} policies - Array of policy objects containing learner assignments.
 * @returns {object[]} - Returns modified policies data with subsidy expiration dates attached to assignments.
 */
export const transformRedeemablePoliciesData = (policies) => policies?.map(policy => {
  const assignmentsWithSubsidyExpiration = policy?.learner_content_assignments?.map(assignment => ({
    ...assignment,
    subsidy_expiration_date: policy.subsidy_expiration_date,
  }));

  return {
    ...policy,
    learner_content_assignments: assignmentsWithSubsidyExpiration,
  };
});

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
export const determineLearnerHasContentAssignmentsOnly = ({
  subscriptionPlan,
  subscriptionLicense,
  licenseRequests,
  couponCodesCount,
  couponCodeRequests,
  redeemableLearnerCreditPolicies,
  hasCurrentEnterpriseOffers,
}) => {
  const hasActiveLicense = !!(subscriptionPlan && subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED);
  const hasActiveLicenseOrLicenseRequest = hasActiveLicense || licenseRequests.length > 0;
  const hasAssignedCodesOrCodeRequests = couponCodesCount > 0 || couponCodeRequests.length > 0;
  const hasAutoAppliedLearnerCreditPolicies = !!redeemableLearnerCreditPolicies?.redeemablePolicies.filter(
    policy => policy.policyType !== POLICY_TYPES.ASSIGNED_CREDIT,
  ).length > 0;
  const hasAssignmentsForDisplay = !!(
    redeemableLearnerCreditPolicies?.learnerContentAssignments.hasAssignmentsForDisplay
  );

  return (
    hasAssignmentsForDisplay
    && !hasCurrentEnterpriseOffers
    && !hasActiveLicenseOrLicenseRequest
    && !hasAssignedCodesOrCodeRequests
    && !hasAutoAppliedLearnerCreditPolicies
  );
};
