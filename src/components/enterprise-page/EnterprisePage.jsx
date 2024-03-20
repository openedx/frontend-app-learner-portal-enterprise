import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
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
import LicenseNotFound from '../license-activation/LicenseNotFound';

const EnterprisePage = ({ children, useEnterpriseConfigCache }) => {
  const { enterpriseSlug } = useParams();
  const [enterpriseConfig, fetchError] = useEnterpriseCustomerConfig(enterpriseSlug, useEnterpriseConfigCache);
  const config = getConfig();
  const [searchClient, searchIndex] = useAlgoliaSearch(config);
  const { authenticatedUser } = useContext(AppContext);
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
      <Container className="py-5">
        <LoadingSpinner screenReaderText="loading organization and user details" />
      </Container>
    );
  }

  if (fetchError) {
    return <ErrorPage message={fetchError.message} />;
  }

  if (isDefinedAndNull(enterpriseConfig)) {
    // check if license activation page then show different page
    const currentUrl = window.location.href;
    const regex = /licenses\/[0-9a-fA-F-]+\/activate/;
    const licenseActivationPatternMatched = regex.test(currentUrl);

    if (licenseActivationPatternMatched) {
      return <LicenseNotFound />;
    }
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
