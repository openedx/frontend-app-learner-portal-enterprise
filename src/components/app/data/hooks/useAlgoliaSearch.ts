import { getConfig } from '@edx/frontend-platform';
import { useEffect, useMemo } from 'react';
import algoliasearch from 'algoliasearch';
import { logError } from '@edx/frontend-platform/logging';
import useBFF from './useBFF';
import useEnterpriseFeatures from './useEnterpriseFeatures';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryDefaultEmptyFallback } from '../queries';

/**
 * Extracts secured Algolia metadata from backend data based on feature and index support flags.
 *
 * Returns the actual secured Algolia API key and catalog UUID mapping only if:
 * - catalog query filters are enabled
 * - the given index is supported
 * - valid data is provided
 *
 * Otherwise, returns a default object with `null` API key and empty mapping.
 *
 * @param data - Backend response data containing Algolia metadata.
 * @param isCatalogQueryFiltersEnabled - Whether catalog query filters are enabled for the enterprise customer.
 * @param isIndexSupported - Whether the specified Algolia index is supported for secured search.
 *
 * @returns An object with the secured Algolia API key and the catalog UUID to query UUID mapping.
 */
const extractAlgolia = ({
  data,
  isCatalogQueryFiltersEnabled,
  isIndexSupported,
}: {
  data: {
    securedAlgoliaApiKey: string | null;
    catalogUuidsToCatalogQueryUuids: Record<string, string>;
  } | null;
  isCatalogQueryFiltersEnabled: boolean;
  isIndexSupported: boolean;
}) => (
  isCatalogQueryFiltersEnabled && isIndexSupported && data
    ? {
      securedAlgoliaApiKey: data.securedAlgoliaApiKey,
      catalogUuidsToCatalogQueryUuids: data.catalogUuidsToCatalogQueryUuids,
    }
    : {
      securedAlgoliaApiKey: null,
      catalogUuidsToCatalogQueryUuids: {},
    });

/**
 * A custom React hook that fetches secured Algolia metadata for a given index,
 * based on enterprise customer configuration and feature flags.
 *
 * Determines whether secured Algolia search can be used for the provided index
 * by checking:
 * - If catalog query filters are enabled for the enterprise customer
 * - If the index is not in the list of unsupported secured indices
 *
 * It then uses a BFF query to retrieve the secured Algolia API key and
 * catalog-to-query UUID mapping. Logs an error if metadata is expected but missing.
 *
 * @param indexName - The Algolia index name to check for support.
 *
 * @returns An object containing:
 * - `isCatalogQueryFiltersEnabled`: Whether secured Algolia is enabled via feature flag.
 * - `isIndexSupported`: Whether the provided index supports secured Algolia.
 * - `securedAlgoliaMetadata`: Metadata containing the secured API key and catalog-query UUID mapping.
 */
const useSecuredAlgoliaMetadata = (indexName: string | null) => {
  const config = getConfig();
  const unsupportedSecuredAlgoliaIndices = [config.ALGOLIA_INDEX_NAME_JOBS];
  const enterpriseCustomerResult = useEnterpriseCustomer();
  const enterpriseCustomer = enterpriseCustomerResult.data!;
  const { data: { catalogQuerySearchFiltersEnabled } } = useEnterpriseFeatures();
  // Waffle flag based determination if we use the secured algolia api key
  const isCatalogQueryFiltersEnabled = !!(
    catalogQuerySearchFiltersEnabled && !!config.ALGOLIA_APP_ID
  );
  const isIndexSupported = !unsupportedSecuredAlgoliaIndices.includes(indexName);

  // Common helper between the BFF call and its empty fallback function
  const queryOptions = {
    select: (data: SecuredAlgoliaApiData | null) => extractAlgolia({
      data,
      isCatalogQueryFiltersEnabled,
      isIndexSupported,
    }),
  };

  // Retrieve secured algolia key from the BFF if the route is enabled
  // or perform a no-op query that resolves to the default secured
  // algolia api key data structure
  const { data: securedAlgoliaMetadata } = useBFF({
    bffQueryOptions: {
      ...queryOptions,
    },
    fallbackQueryConfig: {
      ...queryDefaultEmptyFallback(),
      ...queryOptions,
    },
  });

  useEffect(() => {
    if (isCatalogQueryFiltersEnabled
      && isIndexSupported
      && !securedAlgoliaMetadata?.securedAlgoliaApiKey) {
      logError(
        `Secured Algolia API key is missing, or no applicable
            for enterprise_customer_uuid: ${enterpriseCustomer.uuid}.
            isCatalogQueryFiltersEnabled: ${isCatalogQueryFiltersEnabled},
            indexName: ${indexName},
            securedAlgoliaMetadata: ${JSON.stringify(securedAlgoliaMetadata)}
            `,
      );
    }
  }, [
    enterpriseCustomer.uuid,
    indexName,
    isCatalogQueryFiltersEnabled,
    isIndexSupported, securedAlgoliaMetadata,
    securedAlgoliaMetadata?.securedAlgoliaApiKey,
  ]);

  return {
    isCatalogQueryFiltersEnabled,
    securedAlgoliaMetadata,
    isIndexSupported,
  };
};

/**
 * A custom React hook that initializes and returns Algolia search clients and metadata.
 *
 * It determines the appropriate API key (secured or fallback) based on whether:
 * - catalog query filters are enabled for the enterprise customer, and
 * - the provided index is supported for secured search.
 *
 * It uses `algoliasearch` to instantiate a search client and index, and returns them
 * along with catalog-to-query UUID mappings used for filtering results.
 *
 * @param indexName - Optional custom Algolia index name. Defaults to config's standard index.
 *
 * @returns An object containing:
 * - `searchClient`: The initialized Algolia search client.
 * - `searchIndex`: The configured search index instance.
 * - `catalogUuidsToCatalogQueryUuids`: A mapping used for filtering catalog results.
 */
const useAlgoliaSearch = (indexName: string | null = null) => {
  const config = getConfig();

  const {
    securedAlgoliaMetadata,
    isCatalogQueryFiltersEnabled,
    isIndexSupported,
  } = useSecuredAlgoliaMetadata(indexName);

  // Based on the waffle flag and supported indexes, we will use the secured algolia
  // key or default back to the legacy initialization of the search client and indexes
  const algoliaSearchApiKey = isCatalogQueryFiltersEnabled && isIndexSupported
    ? securedAlgoliaMetadata?.securedAlgoliaApiKey
    : config.ALGOLIA_SEARCH_API_KEY;

  // Update instantiate search client with or without a secured
  // algolia api key and retrieve the initialized algolia index
  const algoliaMetadata = useMemo(() => {
    const searchClient = algoliasearch(
      config.ALGOLIA_APP_ID,
      algoliaSearchApiKey,
    );
    const searchIndex = searchClient.initIndex(indexName || config.ALGOLIA_INDEX_NAME);
    return { searchClient, searchIndex };
  }, [algoliaSearchApiKey, config.ALGOLIA_APP_ID, config.ALGOLIA_INDEX_NAME, indexName]);

  return useMemo(() => ({
    searchIndex: algoliaMetadata.searchIndex,
    searchClient: algoliaMetadata.searchClient,
    catalogUuidsToCatalogQueryUuids: securedAlgoliaMetadata.catalogUuidsToCatalogQueryUuids,
  }), [algoliaMetadata, securedAlgoliaMetadata]);
};

export default useAlgoliaSearch;
