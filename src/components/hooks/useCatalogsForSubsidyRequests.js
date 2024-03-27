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
export default function useCatalogsForSubsidyRequest() {
  const { data: browseAndRequestConfiguration } = useBrowseAndRequestConfiguration();
  const { data: { customerAgreement } } = useSubscriptions();
  const { data: { couponsOverview } } = useCouponCodes();

  const catalogsForSubsidyRequests = useMemo(
    () => {
      const catalogs = [];
      if (!browseAndRequestConfiguration.subsidyRequestsEnabled) {
        return catalogs;
      }
      if (browseAndRequestConfiguration.subsidyType === SUBSIDY_TYPE.LICENSE) {
        const catalogsFromSubscriptions = customerAgreement.availableSubscriptionCatalogs;
        catalogs.push(...catalogsFromSubscriptions);
      }
      if (browseAndRequestConfiguration.subsidyType === SUBSIDY_TYPE.COUPON) {
        const catalogsFromCoupons = couponsOverview
          .filter(coupon => !!coupon.available)
          .map(coupon => coupon.enterpriseCatalogUuid);
        catalogs.push(...new Set(catalogsFromCoupons));
      }
      return catalogs;
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
