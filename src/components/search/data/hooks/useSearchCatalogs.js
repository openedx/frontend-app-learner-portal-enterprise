import { useMemo } from 'react';

import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import { useCatalogsForSubsidyRequests } from '../../../hooks';
import {
  useCouponCodes, useEnterpriseOffers, useRedeemablePolicies, useSubscriptions,
} from '../../../app/data';
import { features } from '../../../../config';

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

  return useMemo(() => {
    // Track catalog uuids to include in search with a Set to avoid duplicates.
    const catalogUUIDs = new Set();

    // Scope to catalogs from redeemable subsidy access policies, coupons,
    // enterprise offers, or subscription plan associated with learner's license.
    redeemablePolicies.forEach((policy) => catalogUUIDs.add(policy.catalogUuid));

    if (subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) {
      catalogUUIDs.add(subscriptionLicense.subscriptionPlan.enterpriseCatalogUuid);
    }
    if (features.ENROLL_WITH_CODES) {
      const availableCouponCodes = couponCodeAssignments.filter(couponCode => couponCode.available);
      availableCouponCodes.forEach((couponCode) => catalogUUIDs.add(couponCode.catalog));
    }

    if (features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS) {
      currentEnterpriseOffers.forEach((offer) => catalogUUIDs.add(offer.enterpriseCatalogUuid));
    }

    // Scope to catalogs associated with assignable subsidies if browse and request is turned on
    catalogsForSubsidyRequests.forEach((catalog) => catalogUUIDs.add(catalog));

    // Convert Set back to array
    return Array.from(catalogUUIDs);
  }, [
    redeemablePolicies,
    catalogsForSubsidyRequests,
    couponCodeAssignments,
    currentEnterpriseOffers,
    subscriptionLicense,
  ]);
}
