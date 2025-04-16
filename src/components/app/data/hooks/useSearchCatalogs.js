import { useMemo } from 'react';

import useEnterpriseOffers from './useEnterpriseOffers';
import useRedeemablePolicies from './useRedeemablePolicies';
import useCatalogsForSubsidyRequests from './useCatalogsForSubsidyRequests';
import { getSearchCatalogs } from '../utils';
import useSubscriptions from './useSubscriptions';
import useCouponCodes from './useCouponCodes';

/**
 * Determines the enterprise catalog UUIDs to filter on, if any, based on the subsidies
 * available to the learner. Enterprise catalogs associated with expired subsidies are
 * excluded. Ensures no duplicate catalog UUIDs are returned.
 */
export default function useSearchCatalogs() {
  const { data: { subscriptionLicense } } = useSubscriptions();
  const { data: { redeemablePolicies } } = useRedeemablePolicies();
  const { data: { couponCodeAssignments } } = useCouponCodes();
  const { data: { currentEnterpriseOffers } } = useEnterpriseOffers();
  const catalogsForSubsidyRequests = useCatalogsForSubsidyRequests();

  return useMemo(() => getSearchCatalogs({
    redeemablePolicies,
    catalogsForSubsidyRequests,
    couponCodeAssignments,
    currentEnterpriseOffers,
    subscriptionLicense,
  }), [
    redeemablePolicies,
    catalogsForSubsidyRequests,
    couponCodeAssignments,
    currentEnterpriseOffers,
    subscriptionLicense,
  ]);
}
