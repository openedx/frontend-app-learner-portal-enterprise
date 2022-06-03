import React, {
  useContext, useMemo, useEffect,
} from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchHeader, SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { useToggle } from '@edx/paragon';

import algoliasearch from 'algoliasearch/lite';
import { useDefaultSearchFilters, useSearchCatalogs } from './data/hooks';
import {
  NUM_RESULTS_PER_PAGE,
  CONTENT_TYPE_COURSE,
  CONTENT_TYPE_PROGRAM,
  COURSE_TITLE,
  PROGRAM_TITLE,
  HEADER_TITLE,
  CONTENT_TYPE_PATHWAY,
  PATHWAY_TITLE,
} from './constants';
import SearchProgram from './SearchProgram';
import SearchCourse from './SearchCourse';
import SearchCourseCard from './SearchCourseCard';
import SearchProgramCard from './SearchProgramCard';
import SearchResults from './SearchResults';
import { features } from '../../config';

import { IntegrationWarningModal } from '../integration-warning-modal';
import { EnterpriseOffersLowBalanceAlert, UserSubsidyContext } from '../enterprise-user-subsidy';
import SearchPathway from './SearchPathway';
import SearchPathwayCard from '../pathway/SearchPathwayCard';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';
import PathwayModal from '../pathway/PathwayModal';

const Search = () => {
  const { pathwayUUID } = useParams();
  const history = useHistory();
  const { refinements: { content_type: contentType } } = useContext(SearchContext);
  const [isLearnerPathwayModalOpen, openLearnerPathwayModal, onClose] = useToggle(false);
  const { enterpriseConfig, algolia } = useContext(AppContext);
  const {
    subscriptionPlan,
    subscriptionLicense,
    couponCodes: { couponCodes },
    enterpriseOffers,
    canEnrollWithEnterpriseOffers,
    hasLowEnterpriseOffersBalance,
  } = useContext(UserSubsidyContext);

  const { catalogsForSubsidyRequests } = useContext(SubsidyRequestsContext);

  const searchCatalogs = useSearchCatalogs({
    subscriptionPlan,
    subscriptionLicense,
    couponCodes,
    enterpriseOffers,
    catalogsForSubsidyRequests,
  });

  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    searchCatalogs,
  });

  useEffect(() => {
    if (pathwayUUID) {
      openLearnerPathwayModal();
    }
  }, [pathwayUUID]);

  const config = getConfig();
  const courseIndex = useMemo(
    () => {
      const client = algoliasearch(
        config.ALGOLIA_APP_ID,
        config.ALGOLIA_SEARCH_API_KEY,
      );
      const cIndex = client.initIndex(config.ALGOLIA_INDEX_NAME);
      return cIndex;
    },
    [], // only initialized once
  );
  const PAGE_TITLE = `${HEADER_TITLE} - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <InstantSearch
        indexName={config.ALGOLIA_INDEX_NAME}
        searchClient={algolia.client}
      >
        <Configure facetingAfterDistinct filters={filters} />
        {contentType?.length > 0 && (
          <Configure
            hitsPerPage={NUM_RESULTS_PER_PAGE}
            filters={`content_type:${contentType[0]} AND ${filters}`}
            clickAnalytics
          />
        )}
        <div className="search-header-wrapper">
          <SearchHeader
            containerSize="lg"
            headerTitle={features.ENABLE_PROGRAMS ? HEADER_TITLE : ''}
            index={courseIndex}
            filters={filters}
            enterpriseConfig={enterpriseConfig}
          />
        </div>

        <PathwayModal
          learnerPathwayUuid={pathwayUUID}
          isOpen={isLearnerPathwayModalOpen}
          onClose={() => {
            history.push(`/${enterpriseConfig.slug}/search`);
            onClose();
          }}
        />
        {canEnrollWithEnterpriseOffers && hasLowEnterpriseOffersBalance && <EnterpriseOffersLowBalanceAlert />}

        { (contentType === undefined || contentType.length === 0) && (
          <>
            {
              features.ENABLE_PATHWAYS && <SearchPathway filter={filters} />
            }
            { features.ENABLE_PROGRAMS ? <SearchProgram filter={filters} /> : <div /> }
            <SearchCourse filter={filters} />
          </>
        )}

        { contentType?.length > 0 && contentType[0] === CONTENT_TYPE_PATHWAY && (
          <SearchResults hitComponent={SearchPathwayCard} title={PATHWAY_TITLE} contentType={CONTENT_TYPE_PATHWAY} />
        )}

        { contentType?.length > 0 && contentType[0] === CONTENT_TYPE_PROGRAM && (
          <SearchResults hitComponent={SearchProgramCard} title={PROGRAM_TITLE} contentType={CONTENT_TYPE_PROGRAM} />
        )}

        { contentType?.length > 0 && contentType[0] === CONTENT_TYPE_COURSE && (
          <SearchResults hitComponent={SearchCourseCard} title={COURSE_TITLE} contentType={CONTENT_TYPE_COURSE} />
        )}
      </InstantSearch>
      <IntegrationWarningModal isOpen={enterpriseConfig.showIntegrationWarning} />
    </>
  );
};

export default Search;
