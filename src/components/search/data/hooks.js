import { useContext, useMemo, useEffect } from 'react';
import {
  SearchContext, getCatalogString, SHOW_ALL_NAME, setRefinementAction,
} from '@edx/frontend-enterprise-catalog-search';
import { features } from '../../../config';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';

export const useDefaultSearchFilters = ({
  enterpriseConfig,
  subscriptionPlan,
  subscriptionLicense,
  offerCatalogs = [],
  subsidyRequestConfiguration,
  catalogsForSubsidyRequests = [],
}) => {
  // default to showing all catalogs
  const { refinements, dispatch } = useContext(SearchContext);

  useEffect(() => {
    // don't default to showing all catalogs if browse and request is turned on
    // and there are catalogs associated with assignable subsidies
    if (
      features.FEATURE_BROWSE_AND_REQUEST
      && subsidyRequestConfiguration?.subsidyRequestsEnabled
      && catalogsForSubsidyRequests.length > 0
    ) {
      return;
    }

    // if the user has no subscriptions or offers, we default to showing all catalogs
    if (!(subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) && offerCatalogs.length < 1) {
      dispatch(setRefinementAction(SHOW_ALL_NAME, 1));
    }
  }, [
    subsidyRequestConfiguration?.subsidyRequestsEnabled,
    catalogsForSubsidyRequests,
    subscriptionLicense?.status,
    offerCatalogs.length,
  ]);

  const filters = useMemo(
    () => {
      // Show all enterprise catalogs
      if (refinements[SHOW_ALL_NAME]) {
        return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
      }

      // Scope to catalogs from coupons and/or the subscription plan associated with learner's license
      const catalogs = [];
      if (features.ENROLL_WITH_CODES) {
        catalogs.push(...offerCatalogs);
      }
      if (subscriptionPlan && subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) {
        catalogs.push(subscriptionPlan.enterpriseCatalogUuid);
      }

      // Scope to catalogs associated with assignable subsidies if browse and request is turned on
      if (
        features.FEATURE_BROWSE_AND_REQUEST
        && subsidyRequestConfiguration?.subsidyRequestsEnabled
        && catalogsForSubsidyRequests.length > 0
      ) {
        catalogs.push(...catalogsForSubsidyRequests);
      }

      if (catalogs.length > 0) {
        return getCatalogString(catalogs);
      }

      // If the learner is not confined to certain catalogs, scope to all of the enterprise's catalogs
      return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
    },
    [
      enterpriseConfig,
      subscriptionPlan,
      offerCatalogs,
      JSON.stringify(refinements),
      subscriptionLicense?.status,
      subsidyRequestConfiguration?.subsidyRequestsEnabled,
      catalogsForSubsidyRequests,
    ],
  );

  return { filters };
};
