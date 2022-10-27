import React from 'react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';

import Search from './Search';
import { SEARCH_FACET_FILTERS, SEARCH_TRACKING_NAME } from './constants';

const SearchPage = () => (
  <SearchData searchFacetFilters={SEARCH_FACET_FILTERS} trackingName={SEARCH_TRACKING_NAME}>
    <Search />
  </SearchData>
);

export default SearchPage;
