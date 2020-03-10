import React from 'react';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import Course from './Course';

export default function CoursePage() {
  return (
    <EnterprisePage>
      <Layout>
        <EnterpriseBanner />
        <Course />
      </Layout>
    </EnterprisePage>
  );
}
