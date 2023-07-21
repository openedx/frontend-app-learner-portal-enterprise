import React, { useCallback, useMemo } from 'react';
import algoliasearch from 'algoliasearch';

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

export const useAlgoliaSearch = (config, indexName) => {
  const [searchClient, searchIndex] = useMemo(
    () => {
      const client = algoliasearch(
        config.ALGOLIA_APP_ID,
        config.ALGOLIA_SEARCH_API_KEY,
      );
      const index = client.initIndex(indexName || config.ALGOLIA_INDEX_NAME);
      return [client, index];
    },
    [config.ALGOLIA_APP_ID, config.ALGOLIA_INDEX_NAME, config.ALGOLIA_SEARCH_API_KEY, indexName],
  );
  return [searchClient, searchIndex];
};
