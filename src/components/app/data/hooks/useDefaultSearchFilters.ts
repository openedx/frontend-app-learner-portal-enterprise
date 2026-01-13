import { useContext, useEffect, useMemo } from 'react';
import { SearchContext, setRefinementAction, SHOW_ALL_NAME } from '@edx/frontend-enterprise-catalog-search';
import { logInfo } from '@edx/frontend-platform/logging';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useSearchCatalogs from './useSearchCatalogs';
import useAlgoliaSearch from './useAlgoliaSearch';
import { getSupportedLocale } from '../utils';
import { AlgoliaFilterBuilder } from '../../../AlgoliaFilterBuilder';

interface SearchContextValue {
  refinements: Record<string, any>;
  dispatch: (action: any) => void;
}

type CommonQueryArgs = {
  showAllRefinement: boolean;
  searchCatalogs: string[];
};

interface QueryByCatalogQueryArgs extends CommonQueryArgs {
  catalogUuidsToCatalogQueryUuids: Record<string, string>;
}

/**
 * Constructs a filter string based on resolved `enterprise_catalog_query_uuids`
 * for each catalog UUID in `searchCatalogs`.
 *
 * @param catalogUuidsToCatalogQueryUuids - Mapping from catalog UUID to query UUID
 * @param searchCatalogs - Catalog UUIDs to resolve and filter on
 * @param showAllRefinement
 * @returns A composed Algolia filter string
 */
const queryByCatalogQuery = ({
  searchCatalogs,
  catalogUuidsToCatalogQueryUuids,
  showAllRefinement,
}: QueryByCatalogQueryArgs) => {
  const builder = new AlgoliaFilterBuilder();

  if (!showAllRefinement && searchCatalogs.length > 0) {
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
  const enterpriseCustomerResult = useEnterpriseCustomer();
  const enterpriseCustomer = enterpriseCustomerResult.data as EnterpriseCustomer;
  const searchCatalogs = useSearchCatalogs();
  const {
    catalogUuidsToCatalogQueryUuids,
    shouldUseSecuredAlgoliaApiKey,
  } = useAlgoliaSearch();

  useEffect(() => {
    // default to showing all catalogs if there are no confined search catalogs
    if (searchCatalogs.length === 0 && !showAllRefinement) {
      dispatch(setRefinementAction(SHOW_ALL_NAME, 1));
    }
  }, [dispatch, searchCatalogs, showAllRefinement]);

  return <string>useMemo(
    () => {
      // If there is a catalog uuid to catalog query uuid mapping, use the secured algolia
      // api key compatible filter query
      let filter: string | null = '';
      if (shouldUseSecuredAlgoliaApiKey) {
        filter = new AlgoliaFilterBuilder()
          .andRaw(queryByCatalogQuery({
            searchCatalogs,
            catalogUuidsToCatalogQueryUuids,
            showAllRefinement,
          }))
          .filterByMetadataLanguage(getSupportedLocale())
          .build();
      } else {
        logInfo(
          `No filter was generated from useDefaultSearchFilters:
          enterpriseCustomerUuid: ${enterpriseCustomer.uuid},
          searchCatalogs: ${searchCatalogs},
          catalogUuidsToCatalogQueryUuids: ${JSON.stringify(catalogUuidsToCatalogQueryUuids)},
          showAllRefinement: ${showAllRefinement}`,
        );
      }

      return filter;
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
