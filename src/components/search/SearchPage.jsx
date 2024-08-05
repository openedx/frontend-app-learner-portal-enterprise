import React from 'react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useSubscriptions } from '../app/data';
import { LICENSE_STATUS } from '../enterprise-user-subsidy/data/constants';
import Search from './Search';
import { SEARCH_TRACKING_NAME } from './constants';
import { getSearchFacetFilters } from './utils';
import { features } from '../../config';

const SearchPage = () => {
  const intl = useIntl();

  const { data: { subscriptionLicense } } = useSubscriptions();
  const hasActivatedAndCurrentSubscription = (
    subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED
    && subscriptionLicense?.subscriptionPlan?.isCurrent
  );

  return (
    <SearchData
      searchFacetFilters={getSearchFacetFilters(intl)}
      trackingName={SEARCH_TRACKING_NAME}
      enableVideos={features.FEATURE_ENABLE_VIDEO_CATALOG && hasActivatedAndCurrentSubscription}
    >
      <Search />
    </SearchData>
  );
};

export default SearchPage;
