import { useQuery } from '@tanstack/react-query';

import { queryCanUpgradeWithLearnerCredit } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

/**
 * Determines whether the given courseRunKey is redeemable with their learner credit policies
 * Returns the first redeemableSubsidyAccessPolicy
 * @returns {Types.UseQueryResult}
 */
export default function useCanUpgradeWithLearnerCredit(courseRunKey, queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { select, ...queryOptionsRest } = queryOptions;
  return useQuery({
    ...queryCanUpgradeWithLearnerCredit(enterpriseCustomer.uuid, courseRunKey),
    ...queryOptionsRest,
    select: (data) => {
      // Base transformed data
      const transformedData = {
        applicableSubsidyAccessPolicy: {
          isPolicyRedemptionEnabled: false,
          redeemableSubsidyAccessPolicy: null,
        },
        listPrice: null,
      };
      // Determine whether the course run key is redeemable. If so, update the transformed data with the
      // applicable subsidy access policy and list price.
      const redeemableCourseRun = data.find((canRedeemData) => (
        canRedeemData.canRedeem && canRedeemData.redeemableSubsidyAccessPolicy
      ));

      if (redeemableCourseRun) {
        transformedData.applicableSubsidyAccessPolicy = {
          isPolicyRedemptionEnabled: true,
          redeemableSubsidyAccessPolicy: redeemableCourseRun.redeemableSubsidyAccessPolicy,
        };
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
  });
}
