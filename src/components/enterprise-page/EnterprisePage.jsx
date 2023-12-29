import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { Container } from '@openedx/paragon';

import { LoadingSpinner } from '../loading-spinner';
import NotFoundPage from '../NotFoundPage';

import {
  isDefined,
  isDefinedAndNotNull,
  isDefinedAndNull,
} from '../../utils/common';
import { useAlgoliaSearch } from '../../utils/hooks';
import { useUpdateActiveEnterpriseForUser, useEnterpriseCustomerConfig } from './data/hooks';
import { pushUserCustomerAttributes } from '../../utils/optimizely';

const EnterprisePage = ({ children, useEnterpriseConfigCache }) => {
  const { enterpriseSlug } = useParams();
  const [enterpriseConfig, fetchError] = useEnterpriseCustomerConfig(enterpriseSlug, useEnterpriseConfigCache);
  const config = getConfig();
  const [searchClient, searchIndex] = useAlgoliaSearch(config);
  const user = getAuthenticatedUser();
  const { profileImage } = user;

  useEffect(() => {
    if (isDefinedAndNotNull(enterpriseConfig)) {
      pushUserCustomerAttributes(enterpriseConfig);
    }
  }, [enterpriseConfig]);

  const { isLoading: isUpdatingActiveEnterprise } = useUpdateActiveEnterpriseForUser({
    enterpriseId: enterpriseConfig?.uuid,
    user,
  });

  const contextValue = useMemo(() => ({
    authenticatedUser: user,
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
  }), [config, enterpriseConfig, searchClient, searchIndex, user]);

  // Render the app as loading while waiting on the configuration or additional user metadata
  if (!isDefined([enterpriseConfig, profileImage]) || isUpdatingActiveEnterprise) {
    return (
      <Container className="py-5">
        <LoadingSpinner screenReaderText="loading organization and user details" />
      </Container>
    );
  }

  if (fetchError) {
    return <ErrorPage message={fetchError.message} />;
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
