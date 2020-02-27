import React from 'react';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';

import { EnterprisePage } from '../enterprise-page';
import { Layout, MainContent, Sidebar } from '../layout';

export default function CoursePage() {
  return (
    <EnterprisePage>
      {(enterpriseConfig) => (
        <Layout>
          <Helmet title={enterpriseConfig.name} />
          <div className="container py-5">
            <div className="row">
              <MainContent>
                <p>Hello</p>
              </MainContent>
              <MediaQuery minWidth={breakpoints.large.minWidth}>
                {matches => matches && (
                  <Sidebar>
                    <p>World</p>
                  </Sidebar>
                )}
              </MediaQuery>
            </div>
          </div>
        </Layout>
      )}
    </EnterprisePage>
  );
}
