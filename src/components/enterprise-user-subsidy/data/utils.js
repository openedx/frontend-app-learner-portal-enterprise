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
