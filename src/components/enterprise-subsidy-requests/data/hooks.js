import {
  useState, useEffect, useContext, useMemo,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { fetchSubsidyRequestConfiguration, fetchLicenseRequests, fetchCouponCodeRequests } from './service';
import { SUBSIDY_TYPE, SUBSIDY_REQUEST_STATE } from '../constants';
import SubsidyRequestsContext from '../SubsidyRequestsContext';

export function useSubsidyRequestConfiguration(enterpriseUUID) {
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
}

/**
 *
 * @param {{
 *    enterpriseCustomerUuid: string,
 *    subsidyRequestsEnabled: boolean,
 *    subsidyType: string
 * }} subsidyRequestConfiguration The subsidy request configuration for the customer
 * @returns {Object} { couponCodeRequests, licenseRequests, isLoading }
 */
export function useSubsidyRequests(subsidyRequestConfiguration) {
  const [licenseRequests, setLicenseRequests] = useState([]);
  const [couponCodeRequests, setCouponCodeRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubsidyRequests = async (subsidyType) => {
    setIsLoading(true);
    try {
      if (subsidyType === SUBSIDY_TYPE.COUPON) {
        const { data: { results } } = await fetchCouponCodeRequests(
          subsidyRequestConfiguration.enterpriseCustomerUuid,
        );
        const requests = camelCaseObject(results);
        setCouponCodeRequests(requests);
      } if (subsidyType === SUBSIDY_TYPE.LICENSE) {
        const { data: { results } } = await fetchLicenseRequests(
          subsidyRequestConfiguration.enterpriseCustomerUuid,
        );
        const requests = camelCaseObject(results);
        setLicenseRequests(requests);
      }
    } catch (error) {
      logError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubsidyRequests = () => {
    if (subsidyRequestConfiguration?.subsidyRequestsEnabled) {
      const { subsidyType } = subsidyRequestConfiguration;
      if (subsidyType) {
        fetchSubsidyRequests(subsidyType);
      }
    }
  };

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
}

/**
 * Returns `true` if user has made a subsidy request.
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
export function useUserHasSubsidyRequestForCourse(courseKey) {
  const {
    subsidyRequestConfiguration,
    licenseRequests,
    couponCodeRequests,
  } = useContext(SubsidyRequestsContext);

  return useMemo(() => {
    if (!subsidyRequestConfiguration) {
      return false;
    }
    switch (subsidyRequestConfiguration.subsidyType) {
      case SUBSIDY_TYPE.LICENSE: {
        const foundLicenseRequest = licenseRequests.find(
          request => request.state === SUBSIDY_REQUEST_STATE.REQUESTED,
        );
        return !!foundLicenseRequest;
      }
      case SUBSIDY_TYPE.COUPON: {
        const foundCouponRequest = couponCodeRequests.find(
          request => request.state === SUBSIDY_REQUEST_STATE.REQUESTED
            && (courseKey ? request.courseId === courseKey : true),
        );
        return !!foundCouponRequest;
      }
      default:
        return false;
    }
  }, [
    courseKey,
    subsidyRequestConfiguration,
    licenseRequests,
    couponCodeRequests,
  ]);
}
