import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { useIntl } from '@edx/frontend-platform/i18n';

import Search from './Search';
import { SEARCH_TRACKING_NAME } from './constants';
import { getSearchFacetFilters } from './utils';
import { features } from '../../config';
import { useHasValidLicenseOrSubscriptionRequestsEnabled } from '../app/data';

const SearchPage = () => {
  const hasValidLicenseOrSubRequest = useHasValidLicenseOrSubscriptionRequestsEnabled();

  const intl = useIntl();
  const enableVideos = (
    features.FEATURE_ENABLE_VIDEO_CATALOG
    && hasValidLicenseOrSubRequest
  );

  return (
    <SearchData
      searchFacetFilters={getSearchFacetFilters(intl)}
      trackingName={SEARCH_TRACKING_NAME}
      enableVideos={enableVideos}
    >
      <Search />
    </SearchData>
  );
};

export default SearchPage;
