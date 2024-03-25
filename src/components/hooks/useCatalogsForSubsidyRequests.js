import {
  useBrowseAndRequestConfiguration,
  useCouponCodes,
  useSubscriptions,
} from '../app/data';

import { SUBSIDY_TYPE } from '../../constants';

/**
 * A custom hook that returns the catalogs that can be used for subsidy requests.
 *
 * TODO: This currently relies on learners having a subscription license before they can
 * request, but we need to know the list of subscription catalog uuids *before* the learner
 * has a subscription license. We need to rely on the customer agreement metadata returning
 * the list of subscription catalog uuids that are available for subsidy requests.
 *
 * @returns {Object} - An object containing the catalogs that can be used for subsidy requests.
 */
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
