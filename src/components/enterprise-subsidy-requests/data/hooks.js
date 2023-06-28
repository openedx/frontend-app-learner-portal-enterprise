import {
  useState, useEffect, useCallback,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import {
  fetchSubsidyRequestConfiguration,
  fetchLicenseRequests,
  fetchCouponCodeRequests,
} from './service';
import { fetchCouponsOverview } from '../../enterprise-user-subsidy/coupons/data/service';
import { SUBSIDY_TYPE, SUBSIDY_REQUEST_STATE } from '../constants';

export const useSubsidyRequestConfiguration = (enterpriseUUID) => {
  const [subsidyRequestConfiguration, setSubsidyRequestConfiguration] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerConfiguration = async () => {
      try {
        const response = await fetchSubsidyRequestConfiguration(enterpriseUUID);
        const config = camelCaseObject(response.data);
        setSubsidyRequestConfiguration(config);
      } catch (error) {
        const httpErrorStatus = error.customAttributes?.httpErrorStatus;
        if (httpErrorStatus === 404) {
          // Customer configuration does not exist, subsidy requests are turned off.
          setSubsidyRequestConfiguration(null);
        } else {
          logError(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerConfiguration(enterpriseUUID);
  }, [enterpriseUUID]);

  return { subsidyRequestConfiguration, isLoading };
};

/**
 * @param {{
 *    enterpriseCustomerUuid: string,
 *    subsidyRequestsEnabled: boolean,
 *    subsidyType: string
 * }} subsidyRequestConfiguration The subsidy request configuration for the customer
 * @returns {Object} { couponCodeRequests, licenseRequests, isLoading }
 */
export const useSubsidyRequests = (subsidyRequestConfiguration) => {
  const [licenseRequests, setLicenseRequests] = useState([]);
  const [couponCodeRequests, setCouponCodeRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubsidyRequests = useCallback(async (subsidyType) => {
    setIsLoading(true);
    try {
      const { email: userEmail } = getAuthenticatedUser();
      const { enterpriseCustomerUuid: enterpriseUUID } = subsidyRequestConfiguration;

      const options = {
        enterpriseUUID,
        userEmail,
        state: SUBSIDY_REQUEST_STATE.REQUESTED,
      };

      if (subsidyType === SUBSIDY_TYPE.COUPON) {
        const { data: { results } } = await fetchCouponCodeRequests(options);
        const requests = camelCaseObject(results);
        setCouponCodeRequests(requests);
      } if (subsidyType === SUBSIDY_TYPE.LICENSE) {
        const { data: { results } } = await fetchLicenseRequests(options);
        const requests = camelCaseObject(results);
        setLicenseRequests(requests);
      }
    } catch (error) {
      logError(error);
    } finally {
      setIsLoading(false);
    }
  }, [subsidyRequestConfiguration]);

  const loadSubsidyRequests = useCallback(() => {
    if (subsidyRequestConfiguration?.subsidyRequestsEnabled) {
      const { subsidyType } = subsidyRequestConfiguration;
      if (subsidyType) {
        fetchSubsidyRequests(subsidyType);
      }
    }
  }, [fetchSubsidyRequests, subsidyRequestConfiguration]);

  useEffect(() => {
    loadSubsidyRequests();
  }, [loadSubsidyRequests]);

  return {
    couponCodeRequests,
    licenseRequests,
    isLoading,
    refreshSubsidyRequests: loadSubsidyRequests,
  };
};

export const useCatalogsForSubsidyRequests = ({
  subsidyRequestConfiguration,
  isLoadingSubsidyRequestConfiguration,
  customerAgreementConfig,
}) => {
  const [catalogs, setCatalogs] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCatalogs = async () => {
      if (subsidyRequestConfiguration.subsidyType === SUBSIDY_TYPE.COUPON) {
        try {
          const response = await fetchCouponsOverview(
            { enterpriseId: subsidyRequestConfiguration.enterpriseCustomerUuid },
          );
          const { results } = camelCaseObject(response.data);
          setCoupons([...new Set(results)]);
          const catalogsFromCoupons = results.map(coupon => coupon.enterpriseCatalogUuid);
          setCatalogs([...new Set(catalogsFromCoupons)]);
        } catch (error) {
          logError(error);
        }
      }

      if (subsidyRequestConfiguration.subsidyType === SUBSIDY_TYPE.LICENSE) {
        const catalogsFromSubscriptions = customerAgreementConfig.subscriptions.map(
          subscription => subscription.enterpriseCatalogUuid,
        );
        setCatalogs([...new Set(catalogsFromSubscriptions)]);
      }

      setIsLoading(false);
    };

    if (!isLoadingSubsidyRequestConfiguration) {
      if (subsidyRequestConfiguration?.subsidyRequestsEnabled) {
        getCatalogs();
        return;
      }
      setIsLoading(false);
    }
  }, [
    customerAgreementConfig,
    isLoadingSubsidyRequestConfiguration,
    subsidyRequestConfiguration,
  ]);

  return {
    coupons,
    catalogs,
    isLoading,
  };
};
