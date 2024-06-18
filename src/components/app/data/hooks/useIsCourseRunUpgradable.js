import { useQuery } from '@tanstack/react-query';

import { queryCanUpgradeWithLearnerCredit } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export function isPolicyRedemptionEnabled({ canRedeemData }) {
  const hasSuccessfulRedemption = canRedeemData?.hasSuccessfulRedemption;
  const redeemableSubsidyAccessPolicy = canRedeemData?.redeemableSubsidyAccessPolicy;
  return hasSuccessfulRedemption || !!redeemableSubsidyAccessPolicy;
}

/**
 * Determines whether the given content identifier is contained within the enterprise customer's catalogs.
 * @returns {Types.UseQueryResult}
 */
export default function useIsCourseRunUpgradable(courseRunKeys, queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { select, ...queryOptionsRest } = queryOptions;
  return useQuery({
    ...queryCanUpgradeWithLearnerCredit(enterpriseCustomer.uuid, courseRunKeys),
    ...queryOptionsRest,
    select: (data) => {
      if (data.length === 0) {
        return {
          applicableSubsidyAccessPolicy: null,
        };
      }
      return {
        applicableSubsidyAccessPolicy: data.flatMap((canRedeemData) => ({
          ...canRedeemData,
          listPrice: canRedeemData?.listPrice?.usd,
          isPolicyRedemptionEnabled: isPolicyRedemptionEnabled({ canRedeemData }),
        }))[0],
      };
    },
  });
}
