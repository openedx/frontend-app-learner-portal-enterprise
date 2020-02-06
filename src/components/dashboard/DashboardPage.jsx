import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';
import { Layout, MainContent, Sidebar } from '@edx/frontend-learner-portal-base/src/components/layout';
import { LoadingSpinner } from '@edx/frontend-learner-portal-base/src/components/loading-spinner';
import { fetchUserAccountSuccess } from '@edx/frontend-auth';
import { getAuthenticatedUser, hydrateAuthenticatedUser, setAuthenticatedUser } from '@edx/frontend-platform/auth';

import { EnterprisePage } from '../enterprise-page';
import { DashboardMainContent } from './main-content';
import { DashboardSidebar } from './sidebar';
import Hero from './Hero';

import { fetchEntepriseCustomerConfig } from './data/service';

const DashboardPage = (props) => {
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
    user: {},
  };
  const { enterpriseName } = initialPageContext;
  const { match: { params: { enterpriseSlug } } } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [pageContext, setPageContext] = useState(initialPageContext);

  if (!enterpriseSlug) {
    throw Error('Missing enterprise slug in the URL');
  }

  useEffect(() => {
    async function hydrateUser() {
      await hydrateAuthenticatedUser();
    }
    const promise1 = hydrateUser();
    const promise2 = fetchEntepriseCustomerConfig(enterpriseSlug);

    Promise.all([promise1, promise2])
      .then((values) => {
        const user = getAuthenticatedUser();
        const responsePromise2 = values[1];
        const json = responsePromise2.data;
        const { results } = json;
        const enterpriseConfig = results.pop();
        if (enterpriseConfig) {
          setPageContext({
            user,
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
        }
        props.setUserAccount({
          username: user.username,
          profileImage: {
            imageURLMedium: user.profileImage.imageURLMedium,
          },
        });
        setAuthenticatedUser(user);
        setIsLoading(false);
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
    }),
  }).isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  setUserAccount: user => dispatch(fetchUserAccountSuccess(user)),
});

export default connect(null, mapDispatchToProps)(DashboardPage);
