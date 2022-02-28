import React, { useContext, createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';
import { useSubsidyRequestConfiguration, useSubsidyRequests } from './data/hooks';
import { features } from '../../config';
import { LoadingSpinner } from '../loading-spinner';
import { LOADING_SCREEN_READER_TEXT } from './constants';

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

  const context = useMemo(() => ({
    subsidyRequestConfiguration,
    licenseRequests,
    couponCodeRequests,
    refreshSubsidyRequests,
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
