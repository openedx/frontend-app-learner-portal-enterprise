import React from 'react';

import SearchData from './SearchContext';
import Search from './Search';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';

const SearchPage = () => (
  <AuthenticatedUserSubsidyPage>
    <SearchData>
      <Search />
    </SearchData>
  </AuthenticatedUserSubsidyPage>
);

export default SearchPage;
