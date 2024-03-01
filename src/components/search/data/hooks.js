import { useContext, useMemo, useEffect } from 'react';
import {
  SearchContext, getCatalogString, SHOW_ALL_NAME, setRefinementAction,
} from '@edx/frontend-enterprise-catalog-search';
import { features } from '../../../config';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';

/**
 * Determines the enterprise catalog UUIDs to filter on, if any, based on the subsidies
 * available to the learner. Enterprise catalogs associated with expired subsidies are
 * excluded. Ensures no duplicate catalog UUIDs are returned.
 */
export const useSearchCatalogs = ({
  subscriptionPlan,
  subscriptionLicense,
  couponCodes,
  enterpriseOffers,
  catalogsForSubsidyRequests,
  redeemableLearnerCreditPolicies,
}) => {
  const searchCatalogs = useMemo(() => {
    // Track catalog uuids to include in search with a Set to avoid duplicates.
    const catalogUUIDs = new Set();

    // Scope to catalogs from redeemable subsidy access policies, coupons,
    // enterprise offers, or subscription plan associated with learner's license.
    if (redeemableLearnerCreditPolicies.redeemablePolicies) {
      const activePolicies = redeemableLearnerCreditPolicies.redeemablePolicies.filter(policy => policy.active);
      activePolicies.forEach((policy) => catalogUUIDs.add(policy.catalogUuid));
    }
    if (subscriptionPlan?.isCurrent && subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) {
      catalogUUIDs.add(subscriptionPlan.enterpriseCatalogUuid);
    }
    if (features.ENROLL_WITH_CODES) {
      const availableCouponCodes = couponCodes.filter(couponCode => couponCode.available);
      availableCouponCodes.forEach((couponCode) => catalogUUIDs.add(couponCode.catalog));
    }
    if (features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS) {
      const currentOffers = enterpriseOffers.filter(offer => offer.isCurrent);
      currentOffers.forEach((offer) => catalogUUIDs.add(offer.enterpriseCatalogUuid));
    }

    // Scope to catalogs associated with assignable subsidies if browse and request is turned on
    catalogsForSubsidyRequests.forEach((catalog) => catalogUUIDs.add(catalog));

    // Convert Set back to array
    return Array.from(catalogUUIDs);
  }, [
    redeemableLearnerCreditPolicies,
    subscriptionPlan,
    subscriptionLicense,
    couponCodes,
    enterpriseOffers,
    catalogsForSubsidyRequests,
  ]);

  return searchCatalogs;
};

export const useDefaultSearchFilters = ({
  enterpriseConfig,
  searchCatalogs,
}) => {
  const { refinements, dispatch } = useContext(SearchContext);
  const showAllRefinement = refinements[SHOW_ALL_NAME];

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
        return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
      }

      if (searchCatalogs.length > 0) {
        return getCatalogString(searchCatalogs);
      }

      // If the learner is not confined to certain catalogs, scope to all of enterprise's catalogs
      return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
    },
    [enterpriseConfig.uuid, searchCatalogs, showAllRefinement],
  );

  return { filters };
};
