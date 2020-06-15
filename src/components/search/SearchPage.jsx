import React from 'react';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import Search from './Search';

export default function SearchPage() {
  return (
    <EnterprisePage>
      <Layout>
        <EnterpriseBanner />
        <Search />
      </Layout>
    </EnterprisePage>
  );
}
