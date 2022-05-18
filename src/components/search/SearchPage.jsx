import React from 'react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';

import Search from './Search';
import { SEARCH_FACET_FILTERS } from './constants';
import { SubsidyRequestsContextProvider } from '../enterprise-subsidy-requests';

const SearchPage = () => (
  <SubsidyRequestsContextProvider>
    <SearchData searchFacetFilters={SEARCH_FACET_FILTERS}>
      <Search />
    </SearchData>
  </SubsidyRequestsContextProvider>
);

export default SearchPage;
