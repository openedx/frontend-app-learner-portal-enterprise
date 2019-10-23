import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';

import { withAuthentication } from '@edx/frontend-learner-portal-base/src/components/with-authentication';
import { Layout, MainContent, Sidebar } from '@edx/frontend-learner-portal-base/src/components/layout';

import { DashboardMainContent } from './main-content';
import { DashboardSidebar } from './sidebar';
import Hero from './Hero';

import { EnterprisePage } from '../enterprise-page';

const DashboardPage = (props) => {
  const { pageContext } = props;
  const { enterpriseName } = pageContext;
  return (
    <EnterprisePage pageContext={pageContext}>
      <Layout
        headerLogo={pageContext.pageBranding.organization_logo.url}
        footerLogo="https://files.edx.org/openedx-logos/edx-openedx-logo-tag.png"
      >
        <Helmet title={enterpriseName} />
        <Hero />
        <div className="container py-5">
          <div className="row">
            <MainContent>
              <DashboardMainContent />
            </MainContent>
            <MediaQuery minWidth={breakpoints.large.minWidth}>
              {matches => matches && (
                <Sidebar>
                  <DashboardSidebar />
                </Sidebar>
              )}
            </MediaQuery>
          </div>
        </div>
      </Layout>
    </EnterprisePage>
  );
};

DashboardPage.propTypes = {
  pageContext: PropTypes.shape({
    enterpriseName: PropTypes.string,
  }).isRequired,
};

export default withAuthentication(DashboardPage);
