import React, { useContext, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { AppContext } from '@edx/frontend-platform/react';

import SearchHeader from './SearchHeader';
import SearchResults from './SearchResults';

import { ALGOLIA_INDEX_NAME, NUM_RESULTS_PER_PAGE } from './data/constants';

const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_SEARCH_API_KEY,
);

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
        <Configure hitsPerPage={NUM_RESULTS_PER_PAGE} filters={filters} />
        <SearchHeader />
        <SearchResults />
      </InstantSearch>
    </>
  );
};

export default Search;
