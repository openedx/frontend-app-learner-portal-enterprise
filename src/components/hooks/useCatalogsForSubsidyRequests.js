import { useMemo } from 'react';

import {
  useBrowseAndRequestConfiguration,
  useCouponCodes,
  useSubscriptions,
} from '../app/data';
import { SUBSIDY_TYPE } from '../../constants';

/**
 * A custom hook that returns the catalogs that can be used for subsidy requests.
 *
 * @returns {Object} - An object containing the catalogs that can be used for subsidy requests.
 */
export default function useCatalogForSubsidyRequest() {
  const { data: browseAndRequestConfiguration } = useBrowseAndRequestConfiguration();
  const { data: { customerAgreement } } = useSubscriptions();
  const { data: { couponsOverview } } = useCouponCodes();

  const catalogsForSubsidyRequests = useMemo(
    () => {
      if (!browseAndRequestConfiguration.subsidyRequestsEnabled) {
        return [];
      }
      if (browseAndRequestConfiguration.subsidyType === SUBSIDY_TYPE.LICENSE) {
        const catalogsFromSubscriptions = customerAgreement.availableSubscriptionCatalogs;
        catalogsForSubsidyRequests.push(...catalogsFromSubscriptions);
      }
      if (browseAndRequestConfiguration.subsidyType === SUBSIDY_TYPE.COUPON) {
        const catalogsFromCoupons = couponsOverview
          .filter(coupon => !!coupon.available)
          .map(coupon => coupon.enterpriseCatalogUuid);
        catalogsForSubsidyRequests.push(...new Set(catalogsFromCoupons));
      }
      return catalogsForSubsidyRequests;
    },
    [
      browseAndRequestConfiguration.subsidyRequestsEnabled,
      browseAndRequestConfiguration.subsidyType,
      couponsOverview,
      customerAgreement.availableSubscriptionCatalogs,
    ],
  );

  return catalogsForSubsidyRequests;
}
