import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { AppContext } from '@edx/frontend-platform/react';

import SearchHeader from './SearchHeader';
import SearchResults from './SearchResults';

import { NUM_RESULTS_PER_PAGE } from './data/constants';
import { useDefaultSearchFilters } from './data/hooks';
import { IntegrationWarningModal } from '../integration-warning-modal';
import { configuration } from '../../config';
import { UserSubsidyContext } from '../enterprise-user-subsidy';

const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_SEARCH_API_KEY,
);

const Search = () => {
  const { enterpriseConfig, subscriptionPlan } = useContext(AppContext);
  const { offers: { offers } } = useContext(UserSubsidyContext);
  const offerCatalogs = offers.map((offer) => offer.catalog);
  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    subscriptionPlan,
    offerCatalogs,
  });

  const PAGE_TITLE = `Search courses - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <InstantSearch
        indexName={configuration.ALGOLIA.ALGOLIA_INDEX_NAME}
        searchClient={searchClient}
      >
        <Configure hitsPerPage={NUM_RESULTS_PER_PAGE} filters={filters} />
        <SearchHeader />
        <SearchResults />
      </InstantSearch>
      <IntegrationWarningModal isOpen={enterpriseConfig.showIntegrationWarning} />
    </>
  );
};

export default Search;
