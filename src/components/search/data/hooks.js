import { useContext, useMemo } from 'react';
import {
  SearchContext, SHOW_ALL_NAME,
} from '@edx/frontend-enterprise-catalog-search';

export const useDefaultSearchFilters = ({
  enterpriseConfig,
}) => {
  // default to showing all catalogs
  const { refinements } = useContext(SearchContext);

  const filters = useMemo(
    () => {
      // show all enterprise catalogs
      if (refinements[SHOW_ALL_NAME]) {
        return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
      }

      // If learner has no subsidy available to them, show all enterprise catalogs
      return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
    },
    [
      enterpriseConfig,
      JSON.stringify(refinements),
    ],
  );

  return { filters };
};
