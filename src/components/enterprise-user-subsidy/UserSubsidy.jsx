import React, {
  createContext, useContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';

import { LoadingSpinner } from '../loading-spinner';

import {
  useOffers,
  useCatalogData,
} from './data/hooks';
import { LOADING_SCREEN_READER_TEXT } from './data/constants';

export const UserSubsidyContext = createContext();

const UserSubsidy = ({ children }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const [offers, isLoadingOffers] = useOffers(enterpriseConfig.uuid);
  const [catalogData, isLoadingCatalogData] = useCatalogData(enterpriseConfig.uuid);

  const isLoadingSubsidies = useMemo(
    () => {
      const loadingStates = [isLoadingOffers, isLoadingCatalogData];
      return loadingStates.includes(true);
    },
    [isLoadingOffers, isLoadingCatalogData],
  );

  const contextValue = useMemo(
    () => {
      if (isLoadingSubsidies) {
        return {};
      }
      return {
        offers,
        catalogData,
      };
    },
    [
      isLoadingSubsidies,
      offers,
      enterpriseConfig.uuid,
      catalogData,
    ],
  );

  if (isLoadingSubsidies) {
    return (
      <Container className="py-5">
        <LoadingSpinner screenReaderText={LOADING_SCREEN_READER_TEXT} />
      </Container>
    );
  }
  return (
    <>
      {/* Render the children so the rest of the page shows */}
      <UserSubsidyContext.Provider value={contextValue}>
        {children}
      </UserSubsidyContext.Provider>
    </>
  );
};

UserSubsidy.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserSubsidy;
