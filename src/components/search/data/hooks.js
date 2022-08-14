import { useContext, useMemo } from 'react';
import {
  SearchContext, getCatalogString, SHOW_ALL_NAME,
} from '@edx/frontend-enterprise-catalog-search';
import { features } from '../../../config';

export const useDefaultSearchFilters = ({
  enterpriseConfig, subscriptionPlan, offerCatalogs = [],
}) => {
  // default to showing all catalogs
  const { refinements } = useContext(SearchContext);

  const filters = useMemo(
    () => {
      // show all enterprise catalogs
      if (refinements[SHOW_ALL_NAME]) {
        return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
      }

      // Filter catalogs by offer catalogs (if any) and/or by the subscription plan catalog associated
      // with learner's license.
      const catalogs = [];
      if (features.ENROLL_WITH_CODES) {
        catalogs.push(...offerCatalogs);
      }
      if (subscriptionPlan) {
        catalogs.push(subscriptionPlan.enterpriseCatalogUuid);
      }
      if (catalogs.length > 0) {
        return getCatalogString(catalogs);
      }

      // If learner has no subsidy available to them, show all enterprise catalogs
      return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
    },
    [
      enterpriseConfig,
      subscriptionPlan,
      offerCatalogs,
      JSON.stringify(refinements),
    ],
  );

  return { filters };
};
