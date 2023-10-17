import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { Button, Container, Hyperlink } from '@edx/paragon';

import { LoadingSpinner } from '../loading-spinner';
import NotFoundPage from '../NotFoundPage';
import { ErrorPage } from '../error-page';

import {
  isDefined,
  isDefinedAndNotNull,
  isDefinedAndNull,
} from '../../utils/common';
import { useAlgoliaSearch } from '../../utils/hooks';
import { useUpdateActiveEnterpriseForUser, useEnterpriseCustomerConfig } from './data';
import { pushUserCustomerAttributes } from '../../utils/optimizely';

const EnterprisePage = ({ children, useEnterpriseConfigCache }) => {
  const { authenticatedUser } = useContext(AppContext);
  const { enterpriseSlug } = useParams();
  const [enterpriseConfig, fetchError] = useEnterpriseCustomerConfig(enterpriseSlug, useEnterpriseConfigCache);
  const config = getConfig();
  const [searchClient, searchIndex] = useAlgoliaSearch(config);
  const { profileImage } = authenticatedUser;

  useEffect(() => {
    if (isDefinedAndNotNull(enterpriseConfig)) {
      pushUserCustomerAttributes(enterpriseConfig);
    }
  }, [enterpriseConfig]);

  const { isLoading: isUpdatingActiveEnterprise } = useUpdateActiveEnterpriseForUser({
    enterpriseId: enterpriseConfig?.uuid,
    user: authenticatedUser,
  });

  const contextValue = useMemo(() => ({
    authenticatedUser,
    config,
    enterpriseConfig,
    courseCards: {
      'in-progress': {
        settingsMenu: {
          hasMarkComplete: true,
        },
      },
    },
    algolia: {
      client: searchClient,
      index: searchIndex,
    },
  }), [config, enterpriseConfig, searchClient, searchIndex, authenticatedUser]);

  // Render the app as loading while waiting on the configuration or additional user metadata
  if (!isDefined([enterpriseConfig, profileImage]) || isUpdatingActiveEnterprise) {
    return (
      <Container data-testid="loading-org-user-details" className="py-5">
        <LoadingSpinner screenReaderText="loading organization and user details" />
      </Container>
    );
  }

  if (fetchError) {
    return (
      <Container className="py-5 text-center">
        <ErrorPage
          title="An unexpected error occurred."
          subtitle="Please click the button below to refresh the page."
          showSiteHeader={false}
          showSiteFooter={false}
        >
          <p className="mb-4">{fetchError.message}</p>
          <Button
            as={Hyperlink}
            destination={window.location.href}
          >
            Try again
          </Button>
        </ErrorPage>
      </Container>
    );
  }

  if (isDefinedAndNull(enterpriseConfig)) {
    return <NotFoundPage />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

EnterprisePage.propTypes = {
  children: PropTypes.node.isRequired,
  useEnterpriseConfigCache: PropTypes.bool,
};

EnterprisePage.defaultProps = {
  useEnterpriseConfigCache: true,
};

export default EnterprisePage;
