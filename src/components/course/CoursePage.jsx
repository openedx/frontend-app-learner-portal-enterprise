import React from 'react';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import { LoginRedirect } from '../login-redirect';
import { UserSubsidy } from '../enterprise-user-subsidy';
import Course from './Course';

export default function CoursePage() {
  return (
    <LoginRedirect>
      <EnterprisePage>
        <Layout>
          <EnterpriseBanner />
          <UserSubsidy>
            <Course />
          </UserSubsidy>
        </Layout>
      </EnterprisePage>
    </LoginRedirect>
  );
}
