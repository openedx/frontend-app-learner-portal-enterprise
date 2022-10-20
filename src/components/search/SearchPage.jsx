import React, { useContext } from 'react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';
import Search from './Search';
import { SEARCH_FACET_FILTERS, SEARCH_TRACKING_NAME } from './constants';

const SearchPage = () => {
  const { enterpriseConfig } = useContext(AppContext);
  return (
    <SearchData
      searchFacetFilters={SEARCH_FACET_FILTERS}
      trackingName={SEARCH_TRACKING_NAME}
      enterpriseUUID={enterpriseConfig.uuid}
    >
      <Search />
    </SearchData>
  );
};

export default SearchPage;
