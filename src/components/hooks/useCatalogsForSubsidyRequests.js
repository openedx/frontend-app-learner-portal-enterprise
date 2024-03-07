import { useQuery } from '@tanstack/react-query';
import {
  queryBrowseAndRequestConfiguration,
  queryCouponCodes,
  querySubscriptions,
} from '../app/data';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { SUBSIDY_TYPE } from '../enterprise-subsidy-requests';

export default function useCatalogForSubsidyRequest() {
  const { uuid } = useEnterpriseCustomer();

  const { data: browseAndRequestsData } = useQuery(queryBrowseAndRequestConfiguration(uuid));
  const { data: couponCodesData } = useQuery(queryCouponCodes(uuid));
  const { data: subscriptionsData } = useQuery(querySubscriptions(uuid));
  const { subscriptionLicenses: subscriptionLicensesData } = subscriptionsData;
  const { couponsOverview: { results: couponsOverviewData } } = couponCodesData;

  const catalogsForSubsidyRequests = [];

  if (!browseAndRequestsData.subsidyRequestsEnabled) {
    return { catalogsForSubsidyRequests };
  }

  if (browseAndRequestsData.subsidyType === SUBSIDY_TYPE.LICENSE) {
    const catalogsFromSubscriptions = subscriptionLicensesData
      .filter(
        subscriptionLicense => subscriptionLicense.subscriptionPlan.daysUntilExpirationIncludingRenewals > 0,
      )
      .map(subscriptionLicense => subscriptionLicense.subscriptionPlan.enterpriseCatalogUuid);

    catalogsForSubsidyRequests.push(...new Set(catalogsFromSubscriptions));
  }

  if (browseAndRequestsData.subsidyType === SUBSIDY_TYPE.COUPON) {
    const catalogsFromCoupons = couponsOverviewData
      .filter(coupon => !!coupon.available)
      .map(coupon => coupon.enterpriseCatalogUuid);

    catalogsForSubsidyRequests.push(...new Set(catalogsFromCoupons));
  }

  return {
    catalogsForSubsidyRequests,
  };
}
