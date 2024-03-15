import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';

import { isDefinedAndNotNull } from '../../utils/common';
import { useAlgoliaSearch } from '../../utils/hooks';
import { pushUserCustomerAttributes } from '../../utils/optimizely';
import { useEnterpriseLearner } from '../app/data';
import LicenseNotFound from '../license-activation/LicenseNotFound';

const EnterprisePage = ({ children }) => {
  const { enterpriseCustomer } = useEnterpriseLearner();
  const config = getConfig();
  const [searchClient, searchIndex] = useAlgoliaSearch(config);
  const { authenticatedUser } = useContext(AppContext);

  useEffect(() => {
    if (isDefinedAndNotNull(enterpriseCustomer)) {
      pushUserCustomerAttributes(enterpriseCustomer);
    }
  }, [enterpriseCustomer]);

  const contextValue = useMemo(() => ({
    authenticatedUser,
    config,
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
};

export default EnterprisePage;
