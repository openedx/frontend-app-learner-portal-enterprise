import React from 'react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';

import Search from './Search';
import { SEARCH_FACET_FILTERS } from './constants';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';

const SearchPage = () => (
  <AuthenticatedUserSubsidyPage>
    <SearchData searchFacetFilters={SEARCH_FACET_FILTERS}>
      <Search />
    </SearchData>
  </AuthenticatedUserSubsidyPage>
);

export default SearchPage;
