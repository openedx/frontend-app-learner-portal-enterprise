import React from 'react';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import { LoginRedirect } from '../login-redirect';
import { UserSubsidy } from '../enterprise-user-subsidy';
import Search from './Search';

const SearchPage = () => (
  <LoginRedirect>
    <EnterprisePage>
      <Layout>
        <EnterpriseBanner />
        <UserSubsidy>
          <Search />
        </UserSubsidy>
      </Layout>
    </EnterprisePage>
  </LoginRedirect>
);

export default SearchPage;
