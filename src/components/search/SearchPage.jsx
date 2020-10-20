import React from 'react';

import Search from './Search';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';

const SearchPage = () => (
  <AuthenticatedUserSubsidyPage>
    <Search />
  </AuthenticatedUserSubsidyPage>
);

export default SearchPage;
