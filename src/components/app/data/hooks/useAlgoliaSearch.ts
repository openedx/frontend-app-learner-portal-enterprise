import {getConfig} from '@edx/frontend-platform/config';
import {useEffect, useMemo} from 'react';
import algoliasearch from 'algoliasearch';
import {logError} from '@edx/frontend-platform/logging';
import useBFF from './useBFF';
import useEnterpriseFeatures from './useEnterpriseFeatures';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import {queryDefaultEmptyFallback} from '../queries';

const extractAlgolia = ({ data, isCatalogQueryFiltersEnabled, isIndexSupported }) => {
  if (!isCatalogQueryFiltersEnabled || !isIndexSupported || !data) {
    return {
      securedAlgoliaApiKey: null,
      catalogUuidsToCatalogQueryUuids: {},
    };
  }
  return {
    securedAlgoliaApiKey: data.securedAlgoliaApiKey,
    catalogUuidsToCatalogQueryUuids: data.catalogUuidsToCatalogQueryUuids,
  };
};

const useSecuredAlgoliaMetadata = (indexName) => {
  const config = getConfig();
  const unsupportedSecuredAlgoliaIndices = [config.ALGOLIA_INDEX_NAME_JOBS];
  const enterpriseCustomerResult = useEnterpriseCustomer();
  const enterpriseCustomer = enterpriseCustomerResult.data!;
  const { data: { catalogQuerySearchFiltersEnabled } } = useEnterpriseFeatures();
  const isCatalogQueryFiltersEnabled = !!(
    catalogQuerySearchFiltersEnabled
    && !!config.ALGOLIA_APP_ID
  );
  const isIndexSupported = !unsupportedSecuredAlgoliaIndices.includes(indexName);
  const queryOptions = {
    select: (data) => extractAlgolia({
      data,
      isCatalogQueryFiltersEnabled,
      isIndexSupported,
    }),
  };

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
    if (isCatalogQueryFiltersEnabled && isIndexSupported && !securedAlgoliaMetadata.securedAlgoliaApiKey) {
      logError(`Secured Algolia API key is missing for enterprise_customer_uuid: ${enterpriseCustomer.uuid}.`);
    }
  }, [
    enterpriseCustomer.uuid,
    isCatalogQueryFiltersEnabled,
    isIndexSupported,
    securedAlgoliaMetadata.securedAlgoliaApiKey,
  ]);

  return {
    isCatalogQueryFiltersEnabled,
    securedAlgoliaMetadata,
    isIndexSupported,
  };
};

const useAlgoliaSearch = (indexName = null) => {
  const config = getConfig();
  const {
    securedAlgoliaMetadata,
    isCatalogQueryFiltersEnabled,
    isIndexSupported,
  } = useSecuredAlgoliaMetadata(indexName);

  const algoliaSearchApiKey = isCatalogQueryFiltersEnabled && isIndexSupported
    ? securedAlgoliaMetadata?.securedAlgoliaApiKey
    : config.ALGOLIA_SEARCH_API_KEY;
  const algoliaMetadata = useMemo(
    () => {
      const searchClient = algoliasearch(
        config.ALGOLIA_APP_ID,
        algoliaSearchApiKey,
      );
      const searchIndex = searchClient.initIndex(indexName || config.ALGOLIA_INDEX_NAME);
      return { searchClient, searchIndex };
    },
    [algoliaSearchApiKey, config.ALGOLIA_APP_ID, config.ALGOLIA_INDEX_NAME, indexName],
  );

  return useMemo(
    () => ({
      searchIndex: algoliaMetadata.searchIndex,
      searchClient: algoliaMetadata.searchClient,
      catalogUuidsToCatalogQueryUuids: securedAlgoliaMetadata.catalogUuidsToCatalogQueryUuids,
    }),
    [algoliaMetadata, securedAlgoliaMetadata],
  );
};

export default useAlgoliaSearch;
