import React from 'react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';

import Search from './Search';
import { SEARCH_FACET_FILTERS } from './constants';

const SearchPage = () => (
  <SearchData searchFacetFilters={SEARCH_FACET_FILTERS}>
    <Search />
  </SearchData>
);

export default SearchPage;
