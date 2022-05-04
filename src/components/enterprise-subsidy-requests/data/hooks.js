import {
  useState, useEffect, useContext, useMemo, useCallback,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { fetchSubsidyRequestConfiguration, fetchLicenseRequests, fetchCouponCodeRequests } from './service';
import { SUBSIDY_TYPE, SUBSIDY_REQUEST_STATE } from '../constants';
import { SubsidyRequestsContext } from '../SubsidyRequestsContextProvider';

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

  const fetchSubsidyRequests = async (subsidyType) => {
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
  };

  const loadSubsidyRequests = useCallback(() => {
    if (subsidyRequestConfiguration?.subsidyRequestsEnabled) {
      const { subsidyType } = subsidyRequestConfiguration;
      if (subsidyType) {
        fetchSubsidyRequests(subsidyType);
      }
    }
  }, [subsidyRequestConfiguration]);

  useEffect(() => {
    loadSubsidyRequests();
  }, [
    subsidyRequestConfiguration?.subsidyRequestsEnabled,
    subsidyRequestConfiguration?.subsidyType,
  ]);

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCatalogs = async () => {
      if (subsidyRequestConfiguration.subsidyType === SUBSIDY_TYPE.COUPON) {
        try {
          // const response = await fetchCouponsOverview(
          //   { enterpriseId: subsidyRequestConfiguration.enterpriseCustomerUuid },
          // );
          const response = {
            data: {
              next: null,
              previous: null,
              count: 7,
              num_pages: 1,
              current_page: 1,
              start: 0,
              results: [{
                id: 83200,
                title: 'BNR Test Coupon Beggs 5',
                start_date: '2022-03-28T00:00:00Z',
                end_date: '2023-03-28T00:00:00Z',
                num_uses: 0,
                usage_limitation: 'Single use',
                num_codes: 1,
                max_uses: 1,
                num_unassigned: 1,
                errors: [],
                available: true,
                enterprise_catalog_uuid: '21c540f9-5115-45ee-9ddb-20c45397f0a8',
              }],
            },
          };
          const { results } = camelCaseObject(response.data);
          const catalogsFromCoupons = results.map(coupon => coupon.enterpriseCatalogUuid);
          setCatalogs(new Set(catalogsFromCoupons));
        } catch (error) {
          logError(error);
        }
      }

      if (subsidyRequestConfiguration.subsidyType === SUBSIDY_TYPE.LICENSE) {
        const catalogsFromSubscriptions = customerAgreementConfig.subscriptions.map(
          subscription => subscription.enterpriseCatalogUuid,
        );
        setCatalogs(new Set(catalogsFromSubscriptions));
      }

      setIsLoading(false);
    };

    if (!isLoadingSubsidyRequestConfiguration) {
      if (subsidyRequestConfiguration?.subsidyRequestsEnabled) {
        getCatalogs();
        return;
      }

      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [isLoadingSubsidyRequestConfiguration, subsidyRequestConfiguration]);

  return {
    catalogs,
    isLoading,
  };
};

/**
 * Returns `true` if user has a subsidy request for the given course.
 *
 * Returns `false` if:
 *  - Subsidy request has not been configured
 *  - No requests are found under the configured `SUBSIDY_TYPE`
 *
 * If the `SUBSIDY_TYPE` is `COUPON`, optional parameter courseKey can be passed
 * to only return true if courseKey is in one of the requests
 *
 * @param {string} [courseKey] - optional filter for specific course
 * @returns {boolean}
 */
export const useUserHasSubsidyRequestForCourse = (courseKey) => {
  const {
    subsidyRequestConfiguration,
    requestsBySubsidyType,
  } = useContext(SubsidyRequestsContext);

  return useMemo(() => {
    if (!subsidyRequestConfiguration?.subsidyRequestsEnabled) {
      return false;
    }
    switch (subsidyRequestConfiguration.subsidyType) {
      case SUBSIDY_TYPE.LICENSE: {
        return requestsBySubsidyType[SUBSIDY_TYPE.LICENSE].length > 0;
      }
      case SUBSIDY_TYPE.COUPON: {
        const foundCouponRequest = requestsBySubsidyType[SUBSIDY_TYPE.COUPON].find(
          request => (!courseKey || request.courseId === courseKey),
        );
        return !!foundCouponRequest;
      }
      default:
        return false;
    }
  }, [
    courseKey,
    subsidyRequestConfiguration,
    requestsBySubsidyType,
  ]);
};
