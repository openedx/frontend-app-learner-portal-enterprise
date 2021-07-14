import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchHeader } from '@edx/frontend-enterprise-catalog-search';

import { useDefaultSearchFilters } from './data/hooks';
import { NUM_RESULTS_PER_PAGE } from './constants';
import SearchResults from './SearchResults';

import { IntegrationWarningModal } from '../integration-warning-modal';
import { UserSubsidyContext } from '../enterprise-user-subsidy';

const Search = () => {
  const { enterpriseConfig, algolia } = useContext(AppContext);
  const { subscriptionPlan, subscriptionLicense, offers: { offers } } = useContext(UserSubsidyContext);
  const offerCatalogs = offers.map((offer) => offer.catalog);
  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    subscriptionPlan,
    subscriptionLicense,
    offerCatalogs,
  });

  const config = getConfig();

  const PAGE_TITLE = `Search courses - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <InstantSearch
        indexName={config.ALGOLIA_INDEX_NAME}
        searchClient={algolia.client}
      >
        <Configure
          hitsPerPage={NUM_RESULTS_PER_PAGE}
          filters={filters}
          clickAnalytics
        />
        <div className="search-header-wrapper">
          <SearchHeader containerSize="lg" />
        </div>
        <SearchResults />
      </InstantSearch>
      <IntegrationWarningModal isOpen={enterpriseConfig.showIntegrationWarning} />
    </>
  );
};

export default Search;
