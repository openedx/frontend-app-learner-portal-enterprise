import React from 'react';

import Search from './Search';
import AuthenticatedPage from '../app/AuthenticatedPage';

const SearchPage = () => (
  <AuthenticatedPage>
    <Search />
  </AuthenticatedPage>
);

export default SearchPage;
