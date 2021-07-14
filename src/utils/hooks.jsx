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

export const useAlgoliaSearch = (config) => {
  const [searchClient, searchIndex] = useMemo(
    () => {
      const client = algoliasearch(
        config.ALGOLIA_APP_ID,
        config.ALGOLIA_SEARCH_API_KEY,
      );
      const index = client.initIndex(config.ALGOLIA_INDEX_NAME);
      return [client, index];
    },
    [JSON.stringify(config)],
  );
  return [searchClient, searchIndex];
};
