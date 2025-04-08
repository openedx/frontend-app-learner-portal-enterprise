import { useContext, useEffect, useMemo } from 'react';
import { SearchContext, setRefinementAction, SHOW_ALL_NAME } from '@edx/frontend-enterprise-catalog-search';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useSearchCatalogs from './useSearchCatalogs';
import useAlgoliaSearch from './useAlgoliaSearch';
import { FilterBuilder } from '../../../FilterBuilder';

interface SearchContextValue {
  refinements: Record<string, any>;
  dispatch: (action: any) => void;
}

interface QueryByCatalogArgs {
  searchCatalogs: string[];
  enterpriseCustomer: EnterpriseCustomer;
  showAllRefinement: boolean;
}

interface QueryByCatalogQueryArgs {
  catalogUuidsToCatalogQueryUuids: Record<string, string>;
  searchCatalogs: string[];
}

/**
 * Constructs a filter string scoped to either all enterprise catalogs or a specific subset,
 * depending on whether `showAllRefinement` is enabled or the search catalog list is empty.
 *
 * @param searchCatalogs - Catalog UUIDs to refine the search by
 * @param enterpriseCustomer - The current enterprise customer context
 * @param showAllRefinement - Whether to bypass catalog filters and show all
 * @returns A composed Algolia filter string
 */
const queryByCatalog = ({
  searchCatalogs,
  enterpriseCustomer,
  showAllRefinement,
}: QueryByCatalogArgs): string => {
  const builder = new FilterBuilder();

  if (showAllRefinement || searchCatalogs.length === 0) {
    builder.filterByEnterpriseCustomerUuid(enterpriseCustomer.uuid);
  } else {
    builder.filterByCatalogUuids(searchCatalogs);
  }

  return builder.excludeVideoContentIfFeatureDisabled().build();
};

/**
 * Constructs a filter string based on resolved `enterprise_catalog_query_uuids`
 * for each catalog UUID in `searchCatalogs`.
 *
 * @param catalogUuidsToCatalogQueryUuids - Mapping from catalog UUID to query UUID
 * @param searchCatalogs - Catalog UUIDs to resolve and filter on
 * @returns A composed Algolia filter string
 */
const queryByCatalogQuery = ({
  catalogUuidsToCatalogQueryUuids,
  searchCatalogs,
}: QueryByCatalogQueryArgs): string => {
  const builder = new FilterBuilder();
  // If a user has a secured algolia api key but no catalogs query to catalog mapping exist
  // Sanity check if empty catalogs still returns an empty algolia key, check catalog service

  if (searchCatalogs.length > 0) {
    builder.filterByCatalogQueryUuids(searchCatalogs, catalogUuidsToCatalogQueryUuids);
  }

  return builder.excludeVideoContentIfFeatureDisabled().build();
};

/**
 * Determines and memoizes the default Algolia filter string to use in search queries,
 * based on the enterprise customer context and search catalog configuration.
 *
 * Automatically applies the "show all" refinement if no search catalogs are present.
 *
 * @returns A default filter string for use in Algolia search requests
 */
export default function useDefaultSearchFilters(): string {
  const { refinements, dispatch } = useContext(SearchContext) as SearchContextValue;
  const showAllRefinement = !!refinements[SHOW_ALL_NAME];
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const searchCatalogs = useSearchCatalogs();
  const { catalogUuidsToCatalogQueryUuids, shouldUseSecuredAlgoliaApiKey } = useAlgoliaSearch();

  useEffect(() => {
    // default to showing all catalogs if there are no confined search catalogs
    if (searchCatalogs.length === 0 && !showAllRefinement) {
      dispatch(setRefinementAction(SHOW_ALL_NAME, 1));
    }
  }, [dispatch, searchCatalogs, showAllRefinement]);

  return useMemo(
    () => {
      // Uses the legacy Algolia filter if there is no catalog uuid to catalog query uuid mapping
      if (shouldUseSecuredAlgoliaApiKey) {
        return queryByCatalogQuery({
          searchCatalogs,
          catalogUuidsToCatalogQueryUuids,
        });
      }
      // If there is a catalog uuid to catalog query uuid mapping, use the secured algolia
      // api key compatible filter query
      return queryByCatalog({
        enterpriseCustomer,
        searchCatalogs,
        showAllRefinement,
      });
    },
    [
      catalogUuidsToCatalogQueryUuids,
      enterpriseCustomer,
      searchCatalogs,
      shouldUseSecuredAlgoliaApiKey,
      showAllRefinement,
    ],
  );
}
