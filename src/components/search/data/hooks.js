import { useContext, useEffect, useMemo } from 'react';
import {
  getCatalogString,
  SearchContext,
  setRefinementAction,
  SHOW_ALL_NAME,
} from '@edx/frontend-enterprise-catalog-search';

import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { useCatalogsForSubsidyRequests } from '../../hooks';
import {
  useCouponCodes,
  useEnterpriseCustomer,
  useEnterpriseOffers,
  useRedeemablePolicies,
  useSubscriptions,
} from '../../app/data';
import { features } from '../../../config';

/**
 * Determines the enterprise catalog UUIDs to filter on, if any, based on the subsidies
 * available to the learner. Enterprise catalogs associated with expired subsidies are
 * excluded. Ensures no duplicate catalog UUIDs are returned.
 */
export const useSearchCatalogs = () => {
  const { data: { subscriptionLicense } } = useSubscriptions();
  const { data: { redeemablePolicies } } = useRedeemablePolicies();
  const { data: { couponCodeAssignments } } = useCouponCodes();
  const { data: { currentEnterpriseOffers } } = useEnterpriseOffers();
  const { catalogsForSubsidyRequests } = useCatalogsForSubsidyRequests();

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
};

export const useDefaultSearchFilters = () => {
  const { refinements, dispatch } = useContext(SearchContext);
  const showAllRefinement = refinements[SHOW_ALL_NAME];
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const searchCatalogs = useSearchCatalogs();
  useEffect(() => {
    // default to showing all catalogs if there are no confined search catalogs
    if (searchCatalogs.length === 0 && !showAllRefinement) {
      dispatch(setRefinementAction(SHOW_ALL_NAME, 1));
    }
  }, [dispatch, searchCatalogs, showAllRefinement]);

  const filters = useMemo(
    () => {
      // Show all enterprise catalogs
      if (showAllRefinement) {
        return `enterprise_customer_uuids:${enterpriseCustomer.uuid}`;
      }

      if (searchCatalogs.length > 0) {
        return getCatalogString(searchCatalogs);
      }

      // If the learner is not confined to certain catalogs, scope to all of enterprise's catalogs
      return `enterprise_customer_uuids:${enterpriseCustomer.uuid}`;
    },
    [enterpriseCustomer.uuid, searchCatalogs, showAllRefinement],
  );

  return { filters };
};
