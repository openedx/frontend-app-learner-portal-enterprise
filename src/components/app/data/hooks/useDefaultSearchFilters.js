import { useContext, useEffect, useMemo } from 'react';
import {
  getCatalogString,
  SearchContext,
  setRefinementAction,
  SHOW_ALL_NAME,
} from '@edx/frontend-enterprise-catalog-search';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useSearchCatalogs from './useSearchCatalogs';

export default function useDefaultSearchFilters() {
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

  return filters;
}
