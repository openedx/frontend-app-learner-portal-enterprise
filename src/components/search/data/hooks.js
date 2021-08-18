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
  const { refinements, dispatch } = useContext(SearchContext);

  useEffect(() => {
    // if the user has no subscriptions or offers, we default to showing all catalogs
    if (!(subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) && offerCatalogs.length < 1) {
      dispatch(setRefinementAction(SHOW_ALL_NAME, 1));
    }
  }, [subscriptionLicense?.status, offerCatalogs.length]);

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
      if (subscriptionPlan && subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) {
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
      subscriptionLicense?.status,
    ],
  );

  return { filters };
};
