import React from 'react';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import { UserSubsidy } from '../enterprise-user-subsidy';
import Course from './Course';

export default function CoursePage() {
  return (
    <EnterprisePage>
      <Layout>
        <EnterpriseBanner />
        <UserSubsidy>
          <Course />
        </UserSubsidy>
      </Layout>
    </EnterprisePage>
  );
}
