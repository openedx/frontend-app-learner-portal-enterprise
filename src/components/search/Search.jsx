import React, { useContext, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { AppContext } from '@edx/frontend-platform/react';

import SearchHeader from './SearchHeader';
import SearchResults from './SearchResults';

const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_SEARCH_API_KEY,
);

export const ALGOLIA_INDEX_NAME = 'enterprise_catalog';

const Search = () => {
  const { enterpriseConfig, subscriptionPlan } = useContext(AppContext);

  const filters = useMemo(
    () => {
      // if there's a subscriptionPlan, filter results by the subscription catalog
      if (subscriptionPlan) {
        return `enterprise_catalog_uuids:${subscriptionPlan.enterpriseCatalogUuid}`;
      }

      // there's no subscription catalog, so filter results by the enterprise customer instead
      return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
    },
    [enterpriseConfig, subscriptionPlan],
  );

  const PAGE_TITLE = `Search courses - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <InstantSearch
        indexName={ALGOLIA_INDEX_NAME}
        searchClient={searchClient}
      >
        <Configure filters={filters} />
        <SearchHeader />
        <SearchResults />
      </InstantSearch>
    </>
  );
};

export default Search;
