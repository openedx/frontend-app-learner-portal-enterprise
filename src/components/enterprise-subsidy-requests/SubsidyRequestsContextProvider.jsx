import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Container } from '@openedx/paragon';
import {
  useSubsidyRequestConfiguration,
  useSubsidyRequests,
} from './data/hooks';
import { LoadingSpinner } from '../loading-spinner';
import { useCatalogsForSubsidyRequests } from '../hooks';
import { LOADING_SCREEN_READER_TEXT, SUBSIDY_TYPE } from '../../constants';
import { useBrowseAndRequestConfiguration, useEnterpriseCustomer } from '../app/data';

export const SubsidyRequestsContext = createContext();

const SubsidyRequestsContextProvider = ({ children }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  // const {
  //   subsidyRequestConfiguration,
  //   isLoading: isLoadingSubsidyRequestConfiguration,
  // } = useSubsidyRequestConfiguration(enterpriseCustomer.uuid);
  //
  const {
    data: subsidyRequestConfiguration,
    isLoading: isLoadingSubsidyRequestConfiguration,
  } = useBrowseAndRequestConfiguration();
  const {
    couponCodeRequests,
    licenseRequests,
    refreshSubsidyRequests,
    isLoading: isLoadingSubsidyRequests,
  } = useSubsidyRequests(subsidyRequestConfiguration);

  const {
    catalogs: catalogsForSubsidyRequests,
  } = useCatalogsForSubsidyRequests();

  const isLoading = isLoadingSubsidyRequestConfiguration
    || isLoadingSubsidyRequests;
    // || isLoadingCatalogsForSubsidyRequests;

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
    refreshSubsidyRequests,
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
