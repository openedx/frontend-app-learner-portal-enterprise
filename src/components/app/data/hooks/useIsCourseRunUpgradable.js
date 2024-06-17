import { useQuery } from '@tanstack/react-query';

import { queryCanUpgradeWithLearnerCredit } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

/**
 * Determines whether the given content identifier is contained within the enterprise customer's catalogs.
 * @returns {Types.UseQueryResult}
 */
export default function useIsCourseRunUpgradable(contentIdentifiers, queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const {
    select, refetchOnMount, refetchOnWindowFocus, ...queryOptionsRest
  } = queryOptions;
  return useQuery({
    ...queryCanUpgradeWithLearnerCredit(enterpriseCustomer.uuid, contentIdentifiers),
    ...queryOptionsRest,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select: (data) => {
      if (data.length === 0) {
        return [];
      }
      return data.flatMap((canRedeem) => {
        if (enterpriseCustomer.hideCourseOriginalPrice) {
          return {
            ...canRedeem,
            listPrice: null,
          };
        }
        return canRedeem;
      });
    },
  });
}
