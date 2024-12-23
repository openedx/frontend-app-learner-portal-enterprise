import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useEnterpriseCustomer, useSubscriptions } from '../app/data';
import Search from './Search';
import { SEARCH_TRACKING_NAME } from './constants';
import { getSearchFacetFilters, hasActivatedAndCurrentSubscription } from './utils';
import { features } from '../../config';

const SearchPage = () => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const intl = useIntl();

  const { data: { subscriptionLicense } } = useSubscriptions();
  const enableVideos = (
    features.FEATURE_ENABLE_VIDEO_CATALOG
    && hasActivatedAndCurrentSubscription(subscriptionLicense, enterpriseCustomer.enableBrowseAndRequest)
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
