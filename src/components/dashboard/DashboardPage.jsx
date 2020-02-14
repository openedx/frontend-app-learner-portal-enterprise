import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';

import { EnterprisePage } from '../enterprise-page';
import { Layout, MainContent, Sidebar } from '../layout';
import { LoadingSpinner } from '../loading-spinner';
import { DashboardMainContent } from './main-content';
import { DashboardSidebar } from './sidebar';
import Hero from './Hero';

import { fetchEntepriseCustomerConfig } from './data/service';

const DashboardPage = (props) => {
  const initialPageContext = {
    enterpriseName: undefined,
    enterpriseUUID: undefined,
    enterpriseEmail: undefined,
    pageBranding: {
      organization_logo: {
        url: undefined,
      },
      banner_border_color: undefined,
      banner_background_color: undefined,
    },
  };
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
            enterpriseEmail: enterpriseConfig.contact_email,
            pageBranding: {
              ...enterpriseConfig.branding_configuration,
              organization_logo: {
                url: enterpriseConfig.branding_configuration.logo,
              },
            },
          });
          setIsLoading(false);
        }
      })
      .catch((error) => {
        logError(new Error(error));
        setPageContext(initialPageContext);
        setIsLoading(false);
      });
  }, [enterpriseSlug]);

  if (isLoading) {
    return (
      <div className="pt-5">
        <LoadingSpinner screenReaderText="loading" />
      </div>
    );
  }

  return (
    <EnterprisePage pageContext={pageContext}>
      <Layout
        headerLogo={pageContext.pageBranding.organization_logo.url}
        footerLogo="https://files.edx.org/openedx-logos/edx-openedx-logo-tag.png"
      >
        <Helmet title={pageContext.enterpriseName} />
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
      enterpriseSlug: PropTypes.string,
    }),
  }).isRequired,
};

export default DashboardPage;
