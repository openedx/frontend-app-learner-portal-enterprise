import { getConfig } from '@edx/frontend-platform/config';
import { useMemo } from 'react';
import algoliasearch from 'algoliasearch';
import useBFF from './useBFF';
import useEnterpriseFeatures from './useEnterpriseFeatures';

const extractAlgolia = ({ data, select, isCatalogQueryFiltersEnabled }) => {
  if (!isCatalogQueryFiltersEnabled) {
    return {
      securedAlgoliaApiKey: null,
      catalogUuidsToCatalogQueryUuids: {},
    };
  }
  const transformedData = {
    securedAlgoliaApiKey: data.securedAlgoliaApiKey,
    catalogUuidsToCatalogQueryUuids: data.catalogUuidsToCatalogQueryUuids,
  };
  if (select) {
    return select({
      original: data,
      transformed: transformedData,
    });
  }
  return transformedData;
};

const useAlgoliaSearchh = (queryOptions = {}, indexName = null) => {
  const { select, ...queryOptionsRest } = queryOptions;
  const { data: { catalogQuerySearchFiltersEnabled } } = useEnterpriseFeatures();
  const config = getConfig();
  const isCatalogQueryFiltersEnabled = !!(
    catalogQuerySearchFiltersEnabled
    && !!config.ALGOLIA_APP_ID
  );
  const { data: securedAlgoliaMetadata } = useBFF({
    bffQueryOptions: {
      ...queryOptionsRest,
      select: (data) => extractAlgolia({ data, select, isCatalogQueryFiltersEnabled }),
    },
    overrideFallbackQueryConfig: true,
  });
  const algoliaMetadata = useMemo(
    () => {
      const searchClient = algoliasearch(
        config.ALGOLIA_APP_ID,
        config.ALGOLIA_SEARCH_API_KEY,
      );
      const searchIndex = searchClient.initIndex(indexName || config.ALGOLIA_INDEX_NAME);
      return { searchClient, searchIndex };
    },
    [config.ALGOLIA_APP_ID, config.ALGOLIA_INDEX_NAME, config.ALGOLIA_SEARCH_API_KEY, indexName],
  );
  return useMemo(
    () => ({
      ...algoliaMetadata,
      ...securedAlgoliaMetadata,
      isCatalogQueryFiltersEnabled,
    }),
    [algoliaMetadata, securedAlgoliaMetadata, isCatalogQueryFiltersEnabled],
  );
};

export default useAlgoliaSearchh;
