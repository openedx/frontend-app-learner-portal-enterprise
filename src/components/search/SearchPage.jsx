import React from 'react';

import { SearchData } from '@edx/frontend-enterprise';
import Search from './Search';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';
import OffersAlert from '../enterprise-user-subsidy/OffersAlert';

const SearchPage = () => (
  <AuthenticatedUserSubsidyPage>
    <OffersAlert />
    <SearchData>
      <Search />
    </SearchData>
  </AuthenticatedUserSubsidyPage>
);

export default SearchPage;
