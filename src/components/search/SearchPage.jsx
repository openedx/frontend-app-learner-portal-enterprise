import React from 'react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { useIntl } from '@edx/frontend-platform/i18n';

import Search from './Search';
import { SEARCH_TRACKING_NAME } from './constants';
import { getSearchFacetFilters } from './utils';

const SearchPage = () => {
  const intl = useIntl();

  return (
    <SearchData searchFacetFilters={getSearchFacetFilters(intl)} trackingName={SEARCH_TRACKING_NAME}>
      <Search />
    </SearchData>
  );
};

export default SearchPage;
