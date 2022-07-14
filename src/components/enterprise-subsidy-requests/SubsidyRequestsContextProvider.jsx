import React, { useContext, createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';
import {
  useCatalogsForSubsidyRequests,
  useSubsidyRequestConfiguration,
  useSubsidyRequests,
} from './data/hooks';
import { features } from '../../config';
import { LoadingSpinner } from '../loading-spinner';
import { LOADING_SCREEN_READER_TEXT, SUBSIDY_TYPE } from './constants';
import { UserSubsidyContext } from '../enterprise-user-subsidy';

export const SubsidyRequestsContext = createContext();

const SubsidyRequestsContextProvider = ({ children }) => {
  const {
    enterpriseConfig: {
      uuid: enterpriseId,
    },
  } = useContext(AppContext);

  const {
    subsidyRequestConfiguration,
    isLoading: isLoadingSubsidyRequestConfiguration,
  } = useSubsidyRequestConfiguration(enterpriseId);

  const {
    couponCodeRequests,
    licenseRequests,
    refreshSubsidyRequests,
    isLoading: isLoadingSubsidyRequests,
  } = useSubsidyRequests(subsidyRequestConfiguration);

  const { customerAgreementConfig } = useContext(UserSubsidyContext);
  const {
    catalogs: catalogsForSubsidyRequests,
    isLoading: isLoadingCatalogsForSubsidyRequests,
  } = useCatalogsForSubsidyRequests({
    subsidyRequestConfiguration,
    isLoadingSubsidyRequestConfiguration,
    customerAgreementConfig,
  });

  const isLoading = isLoadingSubsidyRequestConfiguration
   || isLoadingSubsidyRequests || isLoadingCatalogsForSubsidyRequests;

  const requestsBySubsidyType = useMemo(() => ({
    [SUBSIDY_TYPE.LICENSE]: licenseRequests,
    [SUBSIDY_TYPE.COUPON]: couponCodeRequests,
  }), [licenseRequests, couponCodeRequests]);

  const context = useMemo(() => ({
    subsidyRequestConfiguration,
    requestsBySubsidyType,
    refreshSubsidyRequests,
    catalogsForSubsidyRequests,
  }), [
    subsidyRequestConfiguration,
    requestsBySubsidyType,
    catalogsForSubsidyRequests,
    refreshSubsidyRequests,
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
  const context = useMemo(() => ({
    subsidyRequestConfiguration: null,
    requestsBySubsidyType: {
      [SUBSIDY_TYPE.LICENSE]: [],
      [SUBSIDY_TYPE.COUPON]: [],
    },
    isLoading: false,
    catalogsForSubsidyRequests: [],
  }), []);

  if (features.FEATURE_BROWSE_AND_REQUEST) {
    return <SubsidyRequestsContextProvider {...props} />;
  }

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
