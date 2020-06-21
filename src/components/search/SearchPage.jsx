import React from 'react';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import { UserSubsidy } from '../enterprise-user-subsidy';
import Search from './Search';

const SearchPage = () => (
  <EnterprisePage>
    <Layout>
      <EnterpriseBanner />
      <UserSubsidy>
        <Search />
      </UserSubsidy>
    </Layout>
  </EnterprisePage>
);

export default SearchPage;
