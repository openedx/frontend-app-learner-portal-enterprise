import {
  useBrowseAndRequestConfiguration,
  useCouponCodes,
  useSubscriptions,
} from '../app/data';

import { SUBSIDY_TYPE } from '../../constants';

export default function useCatalogForSubsidyRequest() {
  const { data: browseAndRequestConfiguration } = useBrowseAndRequestConfiguration();
  const { data: { subscriptionLicenses } } = useSubscriptions();
  const { data: { couponsOverview } } = useCouponCodes();

  const catalogsForSubsidyRequests = [];

  if (!browseAndRequestConfiguration.subsidyRequestsEnabled) {
    return { catalogsForSubsidyRequests };
  }

  if (browseAndRequestConfiguration.subsidyType === SUBSIDY_TYPE.LICENSE) {
    const catalogsFromSubscriptions = subscriptionLicenses
      .filter(
        subscriptionLicense => subscriptionLicense.subscriptionPlan.daysUntilExpirationIncludingRenewals > 0,
      )
      .map(subscriptionLicense => subscriptionLicense.subscriptionPlan.enterpriseCatalogUuid);

    catalogsForSubsidyRequests.push(...new Set(catalogsFromSubscriptions));
  }

  if (browseAndRequestConfiguration.subsidyType === SUBSIDY_TYPE.COUPON) {
    const catalogsFromCoupons = couponsOverview
      .filter(coupon => !!coupon.available)
      .map(coupon => coupon.enterpriseCatalogUuid);

    catalogsForSubsidyRequests.push(...new Set(catalogsFromCoupons));
  }

  return {
    catalogsForSubsidyRequests,
  };
}
