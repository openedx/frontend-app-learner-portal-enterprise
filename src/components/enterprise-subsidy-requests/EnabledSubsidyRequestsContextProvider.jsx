import React, { useContext, useMemo } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';
import PropTypes from 'prop-types';
import { useSubsidyRequestConfiguration, useSubsidyRequests } from './data/hooks';
import { LoadingSpinner } from '../loading-spinner';
import { LOADING_SCREEN_READER_TEXT } from './constants';
import SubsidyRequestsContext from './SubsidyRequestsContext';

const EnabledSubsidyRequestsContextProvider = ({ children }) => {
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

EnabledSubsidyRequestsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default EnabledSubsidyRequestsContextProvider;
