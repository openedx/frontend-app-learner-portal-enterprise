import React, { useContext, createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';
import {
  useCatalogsForSubsidyRequests,
  useSubsidyRequestConfiguration,
  useSubsidyRequests,
} from './data/hooks';
import { LoadingSpinner } from '../loading-spinner';
import { LOADING_SCREEN_READER_TEXT, SUBSIDY_TYPE } from './constants';
import { UserSubsidyContext } from '../enterprise-user-subsidy';

export const SubsidyRequestsContext = createContext();

const SubsidyRequestsContextProvider = ({ children }) => {
  const {
    enterpriseConfig: {
      uuid: enterpriseUUID,
    },
  } = useContext(AppContext);

  const {
    subsidyRequestConfiguration,
    isLoading: isLoadingSubsidyRequestConfiguration,
  } = useSubsidyRequestConfiguration(enterpriseUUID);

  const {
    couponCodeRequests,
    licenseRequests,
    refreshSubsidyRequests,
    isLoading: isLoadingSubsidyRequests,
  } = useSubsidyRequests(subsidyRequestConfiguration);

  const { customerAgreementConfig } = useContext(UserSubsidyContext);
  const {
    coupons: couponsForSubsidyRequests,
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
    couponsForSubsidyRequests,
    catalogsForSubsidyRequests,
  }), [
    subsidyRequestConfiguration,
    requestsBySubsidyType,
    refreshSubsidyRequests,
    couponsForSubsidyRequests,
    catalogsForSubsidyRequests,
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

SubsidyRequestsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SubsidyRequestsContextProvider;
