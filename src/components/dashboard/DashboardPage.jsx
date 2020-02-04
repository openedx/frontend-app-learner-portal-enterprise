import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';

import { withAuthentication } from '@edx/frontend-learner-portal-base/src/components/with-authentication';
import { Layout, MainContent, Sidebar } from '@edx/frontend-learner-portal-base/src/components/layout';
import { LoadingSpinner } from '@edx/frontend-learner-portal-base/src/components/loading-spinner';

import { EnterprisePage } from '../enterprise-page';
import { DashboardMainContent } from './main-content';
import { DashboardSidebar } from './sidebar';
import Hero from './Hero';

import { fetchEntepriseCustomerConfig } from './data/service';

const DashboardPage = (props) => {
  const initialPageContext = {
    enterpriseName: null,
    enterpriseUUID: null,
    enterpriseEmail: 'a@a.com',
    pageBranding: {
      organization_logo: {
        url: null,
      },
      banner_border_color: '#cccccc',
      banner_background_color: '#efefef',
    },
  };
  const { enterpriseName } = initialPageContext;
  const { match: { params: { enterpriseSlug } } } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [pageContext, setPageContext] = useState(initialPageContext);

  if (!enterpriseSlug) {
    throw Error('Missing enterprise slug in the URL');
  }

  useEffect(() => {
    fetchEntepriseCustomerConfig(enterpriseSlug)
      .then((response) => {
        const json = response.data;
        const { results } = json;
        const enterpriseConfig = results.pop();
        setIsLoading(false);
        if (enterpriseConfig) {
          setPageContext({
            enterpriseName: enterpriseConfig.name,
            enterpriseUUID: enterpriseConfig.uuid,
            enterpriseEmail: initialPageContext.enterpriseEmail,
            pageBranding: {
              ...initialPageContext.pageBranding,
              organization_logo: {
                url: enterpriseConfig.branding_configuration.logo,
              },
            },
          });
        }
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
        setPageContext(initialPageContext);
      });
  }, [enterpriseSlug]);

  if (isLoading) {
    return <LoadingSpinner screenReaderText="loading" />;
  }

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
  match: PropTypes.shape({
    params: PropTypes.shape({
      enterpriseName: PropTypes.string,
    }),
  }).isRequired,
};

export default withAuthentication(DashboardPage);
