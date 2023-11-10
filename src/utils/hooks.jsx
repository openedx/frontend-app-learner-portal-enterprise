import React, { useCallback, useEffect, useMemo, useState } from 'react';
import algoliasearch from 'algoliasearch';

import { fetchAlgoliaSecuredApiKey } from './common';

export const useRenderContactHelpText = (enterpriseConfig) => {
  const renderContactHelpText = useCallback(
    (LinkComponent = 'a') => {
      const { contactEmail } = enterpriseConfig;
      const message = 'reach out to your organization\'s edX administrator';

      if (!contactEmail) {
        return message;
      }
      return (
        <LinkComponent href={`mailto:${contactEmail}`}>
          {message}
        </LinkComponent>
      );
    },
    [enterpriseConfig],
  );

  return renderContactHelpText;
};

export const useAlgoliaSearchApiKey = (config) => {
  // If the search API key is not provided in the config,
  // fetch it from `ALGOLIA_SECURED_KEY_ENDPOINT`.

  const [searchApiKey, setSearchApiKey] = useState(config.ALGOLIA_SEARCH_API_KEY);

  useEffect(() => {
    const fetchApiKey = async () => {
      const key = await fetchAlgoliaSecuredApiKey();
      setSearchApiKey(key);
    };

    if (!config.ALGOLIA_SEARCH_API_KEY) {
      fetchApiKey();
    }
  }, [config.ALGOLIA_SEARCH_API_KEY]);

  return searchApiKey;
}

export const useAlgoliaSearch = (config, indexName) => {
  const algoliaSearchApiKey = useAlgoliaSearchApiKey(config);
  const [searchClient, searchIndex] = useMemo(
    () => {
      const client = algoliasearch(
        config.ALGOLIA_APP_ID,
        algoliaSearchApiKey,
      );
      const index = client.initIndex(indexName || config.ALGOLIA_INDEX_NAME);
      return [client, index];
    },
    [config.ALGOLIA_APP_ID, config.ALGOLIA_INDEX_NAME, algoliaSearchApiKey, indexName],
  );
  return [searchClient, searchIndex];
};
