import { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { getLoggingService } from '@edx/frontend-platform/logging';

import { isDefinedAndNotNull } from '../../utils/common';
import { pushUserCustomerAttributes } from '../../utils/optimizely';
import { useEnterpriseCustomer, useEnterpriseLearner, useIsBFFEnabled } from '../app/data';

/**
 * Custom hook to set custom attributes for logging service:
 * - enterprise_customer_uuid - The UUID of the enterprise customer
 * - is_bff_enabled - Whether the BFF is enabled for the enterprise customer
 */
function useLoggingCustomAttributes() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: enterpriseFeaturesByCustomer } = useEnterpriseLearner({
    select: (data) => data.transformed.enterpriseFeaturesByCustomer,
  });
  const isBFFEnabled = useIsBFFEnabled();

  useEffect(() => {
    if (isDefinedAndNotNull(enterpriseCustomer)) {
      pushUserCustomerAttributes(enterpriseCustomer);

      const featuresForCustomer = enterpriseFeaturesByCustomer[enterpriseCustomer.uuid];
      const isBFFConcurrencyEnabled = !!featuresForCustomer?.enterpriseLearnerBffConcurrentRequests;

      // Set custom attributes via logging service
      const loggingService = getLoggingService();
      loggingService.setCustomAttribute('enterprise_customer_uuid', enterpriseCustomer.uuid);
      loggingService.setCustomAttribute('is_bff_enabled', isBFFEnabled);
      loggingService.setCustomAttribute('is_bff_concurrency_enabled', isBFFConcurrencyEnabled);
    }
  }, [enterpriseCustomer, isBFFEnabled, enterpriseFeaturesByCustomer]);
}

const EnterprisePage = ({ children }) => {
  const config = getConfig();
  const { authenticatedUser } = useContext(AppContext);

  // Set custom attributes via logging service
  useLoggingCustomAttributes();

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
  }), [config, authenticatedUser]);

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
