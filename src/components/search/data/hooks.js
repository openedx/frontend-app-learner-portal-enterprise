import { useContext, useMemo, useEffect } from 'react';
import {
  SearchContext, getCatalogString, SHOW_ALL_NAME, setRefinementAction,
} from '@edx/frontend-enterprise-catalog-search';
import { features } from '../../../config';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';

export const useDefaultSearchFilters = ({
  enterpriseConfig, subscriptionPlan, subscriptionLicense, offerCatalogs = [],
}) => {
  // default to showing all catalogs
  const { refinementsFromQueryParams, dispatch } = useContext(SearchContext);

  useEffect(() => {
    // if the user has no subscriptions or offers, we default to showing all catalogs
    if (!(subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) && offerCatalogs.length < 1) {
      dispatch(setRefinementAction(SHOW_ALL_NAME, 1));
    }
  }, [subscriptionLicense?.status, offerCatalogs.length]);

  const filters = useMemo(
    () => {
      if (refinementsFromQueryParams[SHOW_ALL_NAME]) {
        // show all enterprise catalogs
        return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
      }
      // if there's a subscriptionPlan, filter results by the subscription catalog
      // and any catalogs for which the user has vouchers
      if (subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) {
        if (features.ENROLL_WITH_CODES && offerCatalogs.length > 0) {
          const catalogs = [subscriptionPlan.enterpriseCatalogUuid, ...offerCatalogs];
          return getCatalogString(catalogs);
        }
        return `enterprise_catalog_uuids:${subscriptionPlan.enterpriseCatalogUuid}`;
      }
      if (features.ENROLL_WITH_CODES && offerCatalogs.length > 0) {
        // shows catalogs for which a user has 100% vouchers
        return getCatalogString(offerCatalogs);
      }
      return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
    },
    [
      enterpriseConfig,
      subscriptionPlan,
      offerCatalogs,
      refinementsFromQueryParams[SHOW_ALL_NAME],
      subscriptionLicense?.status,
    ],
  );

  return { filters };
};
