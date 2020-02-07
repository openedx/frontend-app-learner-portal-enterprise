import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';

import { EnterprisePage } from '../enterprise-page';
import { Layout, MainContent, Sidebar } from '../layout';
import { LoadingSpinner } from '../loading-spinner';
import { DashboardMainContent } from './main-content';
import { DashboardSidebar } from './sidebar';
import Hero from './Hero';

import { fetchEntepriseCustomerConfig } from './data/service';

const DashboardPage = (props) => {
  // TODO: Fix this initial context
  const initialPageContext = {
    enterpriseName: null,
    enterpriseUUID: 'f7bd4890-ac0c-4cd2-b202-64444d07171e',
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
        const { results } = response.data;
        const enterpriseConfig = results.pop();
        if (enterpriseConfig) {
          setPageContext({
            enterpriseName: enterpriseConfig.name,
            enterpriseUUID: enterpriseConfig.uuid,
            enterpriseEmail: enterpriseConfig.enterpriseEmail,
            pageBranding: {
              ...enterpriseConfig.pageBranding,
              organization_logo: {
                url: enterpriseConfig.branding_configuration.logo,
              },
            },
          });
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setPageContext(initialPageContext);
        setIsLoading(false);
      });
  }, [enterpriseSlug]);


  if (isLoading) {
    return (
      <EnterprisePage pageContext={pageContext}>
        <LoadingSpinner screenReaderText="loading" />
      </EnterprisePage>
    );
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
      enterpriseSlug: PropTypes.string,
    }),
  }).isRequired,
};

export default DashboardPage;
