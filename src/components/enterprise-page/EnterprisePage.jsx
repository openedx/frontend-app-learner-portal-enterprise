import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { getLoggingService } from '@edx/frontend-platform/logging';

import { isDefinedAndNotNull } from '../../utils/common';
import { useAlgoliaSearch } from '../../utils/hooks';
import { pushUserCustomerAttributes } from '../../utils/optimizely';
import { useEnterpriseCustomer } from '../app/data';

const EnterprisePage = ({ children }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const config = getConfig();
  const [searchClient, searchIndex] = useAlgoliaSearch(config);
  const { authenticatedUser } = useContext(AppContext);

  useEffect(() => {
    if (isDefinedAndNotNull(enterpriseCustomer)) {
      pushUserCustomerAttributes(enterpriseCustomer);

      // Set custom attributes for logging service
      const loggingService = getLoggingService();
      loggingService.setCustomAttribute('enterprise_customer_uuid', enterpriseCustomer.uuid);
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
  }), [config, searchClient, searchIndex, authenticatedUser]);

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
