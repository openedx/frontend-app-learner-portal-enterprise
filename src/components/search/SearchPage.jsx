import React from 'react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';

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
