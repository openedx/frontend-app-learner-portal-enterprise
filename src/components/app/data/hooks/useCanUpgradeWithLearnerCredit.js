import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { queryCanUpgradeWithLearnerCredit } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

/**
 * Determines whether the given courseRunKey is redeemable with their learner credit policies
 * Returns the first redeemableSubsidyAccessPolicy
 *
 * @returns The query result.
 */
export default function useCanUpgradeWithLearnerCredit(courseRunKey, options = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { select } = options;
  return useSuspenseQuery(
    queryOptions({
      ...queryCanUpgradeWithLearnerCredit(enterpriseCustomer.uuid, courseRunKey),
      select: (data) => {
        // Base transformed data
        const transformedData = {
          applicableSubsidyAccessPolicy: null,
          listPrice: null,
        };

        // Determine whether the course run key is redeemable. If so, update the transformed data with the
        // applicable subsidy access policy and list price.
        const redeemableCourseRun = data.filter((canRedeemData) => (
          canRedeemData.canRedeem && canRedeemData.redeemableSubsidyAccessPolicy
        ))[0];
        if (redeemableCourseRun) {
          const applicableSubsidyAccessPolicy = redeemableCourseRun.redeemableSubsidyAccessPolicy;
          applicableSubsidyAccessPolicy.isPolicyRedemptionEnabled = true;
          transformedData.applicableSubsidyAccessPolicy = applicableSubsidyAccessPolicy;
          transformedData.listPrice = redeemableCourseRun.listPrice.usd;
        }

        // When custom `select` function is provided in `queryOptions`, call it with original and transformed data.
        if (select) {
          return select({
            original: data,
            transformed: transformedData,
          });
        }

        // Otherwise, return the transformed data.
        return transformedData;
      },
    }),
  );
}
