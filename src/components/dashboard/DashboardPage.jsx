import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';
import { Layout, MainContent, Sidebar } from '@edx/frontend-learner-portal-base/src/components/layout';
import { LoadingSpinner } from '@edx/frontend-learner-portal-base/src/components/loading-spinner';
import { fetchUserAccountSuccess } from '@edx/frontend-auth';

import { EnterprisePage } from '../enterprise-page';
import { DashboardMainContent } from './main-content';
import { DashboardSidebar } from './sidebar';
import Hero from './Hero';

import { useAppSetup } from './data/hooks';

const DashboardPage = (props) => {
  const initialPageContext = {
    enterpriseName: null,
    enterpriseUUID: null,
    enterpriseEmail: null,
    pageBranding: {
      organization_logo: {
        url: null,
      },
      banner_border_color: null,
      banner_background_color: null,
    },
  };
  const {
    match: { params: { enterpriseSlug } },
    setUserAccount,
    username,
  } = props;

  const [pageContext, setPageContext] = useState(initialPageContext);
  const [user, enterpriseConfig] = useAppSetup(enterpriseSlug);

  useEffect(() => {
    if (user && !username) {
      setUserAccount({
        username: user.username,
        profileImage: {
          imageURLMedium: user.profileImage.imageUrlMedium,
        },
      });
    }
  }, [user]);

  useEffect(() => {
    if (enterpriseConfig) {
      setPageContext({
        enterpriseName: enterpriseConfig.name,
        enterpriseUUID: enterpriseConfig.uuid,
        enterpriseEmail: enterpriseConfig.contact_email,
        pageBranding: {
          organization_logo: {
            url: enterpriseConfig.branding_configuration.logo,
          },
          banner_border_color: enterpriseConfig.branding_configuration.banner_border_color,
          banner_background_color: enterpriseConfig.branding_configuration.banner_background_color,
        },
      });
    }
  }, [enterpriseConfig]);

  if (!username || !enterpriseConfig || !pageContext.enterpriseUUID) {
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
  setUserAccount: PropTypes.func.isRequired,
  username: PropTypes.string,
};

DashboardPage.defaultProps = {
  username: null,
};

const mapStateToProps = state => ({
  username: state.userAccount.username,
});

const mapDispatchToProps = dispatch => ({
  setUserAccount: user => dispatch(fetchUserAccountSuccess(user)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage);
