import React from 'react';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import Search from './Search';

const SearchPage = () => (
  <EnterprisePage>
    <Layout>
      <EnterpriseBanner />
      <Search />
    </Layout>
  </EnterprisePage>
);

export default SearchPage;
