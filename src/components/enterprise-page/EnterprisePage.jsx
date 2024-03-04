import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';

import { isDefinedAndNotNull } from '../../utils/common';
import { useAlgoliaSearch } from '../../utils/hooks';
import { pushUserCustomerAttributes } from '../../utils/optimizely';
import { useEnterpriseLearner } from '../app/data';

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
