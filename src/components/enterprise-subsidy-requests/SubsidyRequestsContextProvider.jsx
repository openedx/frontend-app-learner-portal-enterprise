import React, {
  useContext, createContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';
import { useSubsidyRequestConfiguration, useSubsidyRequests } from './data/hooks';
import { features } from '../../config';
import { LoadingSpinner } from '../loading-spinner';
import {
  LOADING_SCREEN_READER_TEXT,
  SUBSIDY_REQUEST_STATE,
  SUBSIDY_TYPE,
} from './constants';
import {
  postCouponCodeRequest,
  postLicenseRequest,
} from './data/service';

export const SubsidyRequestsContext = createContext();

const SubsidyRequestsContextProvider = ({ children }) => {
  const {
    enterpriseConfig: {
      uuid,
    },
  } = useContext(AppContext);

  const { subsidyRequestConfiguration, isLoading: isLoadingConfiguration } = useSubsidyRequestConfiguration(uuid);

  const {
    couponCodeRequests,
    licenseRequests,
    refreshSubsidyRequests,
    isLoading: isLoadingSubsidyRequests,
  } = useSubsidyRequests(subsidyRequestConfiguration);
  const isLoading = isLoadingConfiguration || isLoadingSubsidyRequests;

  /**
   * Returns `true` if user has made a course request.
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
  const userHasRequest = (courseKey) => {
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
  };

  /**
   * Requests subsidy to specified course.
   * @param {string} courseKey - Course to request.
   * @returns {Promise}
   */
  const requestSubsidy = async (courseKey) => {
    switch (subsidyRequestConfiguration.subsidyType) {
      case SUBSIDY_TYPE.LICENSE:
        return postLicenseRequest(subsidyRequestConfiguration.enterpriseCustomerUuid, courseKey);
      case SUBSIDY_TYPE.COUPON:
        return postCouponCodeRequest(subsidyRequestConfiguration.enterpriseCustomerUuid, courseKey);
      default:
        throw new Error('Subsidy request configuration not set');
    }
  };

  const context = useMemo(() => ({
    subsidyRequestConfiguration,
    licenseRequests,
    couponCodeRequests,
    refreshSubsidyRequests,
    userHasRequest,
    requestSubsidy,
  }), [
    subsidyRequestConfiguration,
    licenseRequests,
    couponCodeRequests,
  ]);

  if (isLoading) {
    return (
      <Container className="py-5">
        <LoadingSpinner screenReaderText={LOADING_SCREEN_READER_TEXT} />
      </Container>
    );
  }

  return (
    <SubsidyRequestsContext.Provider value={context}>
      {children}
    </SubsidyRequestsContext.Provider>
  );
};

const SubsidyRequestsContextProviderWrapper = (props) => {
  if (features.FEATURE_BROWSE_AND_REQUEST) {
    return <SubsidyRequestsContextProvider {...props} />;
  }

  const context = {
    subsidyRequestConfiguration: null,
    licenseRequests: [],
    couponCodeRequests: [],
    isLoading: false,
  };

  return (
    <SubsidyRequestsContext.Provider value={context}>
      {props.children}
    </SubsidyRequestsContext.Provider>
  );
};

SubsidyRequestsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

SubsidyRequestsContextProviderWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SubsidyRequestsContextProviderWrapper;
