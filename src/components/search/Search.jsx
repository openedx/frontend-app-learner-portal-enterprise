import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch } from 'react-instantsearch-dom';
import { Helmet } from 'react-helmet';

import SearchHeader from './SearchHeader';
import SearchResults from './SearchResults';
import StateResults from './StateResults';

const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_SEARCH_API_KEY,
);

export const PAGE_TITLE = 'Search for a course';
export const ALGOLIA_INDEX_NAME = 'enterprise_catalog';

const Search = () => (
  <>
    <Helmet title={PAGE_TITLE} />
    <InstantSearch
      indexName={ALGOLIA_INDEX_NAME}
      searchClient={searchClient}
    >
      <StateResults>
        <SearchHeader />
        <SearchResults />
      </StateResults>
    </InstantSearch>
  </>
);

export default Search;
