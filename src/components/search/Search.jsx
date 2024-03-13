import React, {
  useContext, useEffect,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchHeader, SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { useToggle, Stack } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useDefaultSearchFilters } from './data/hooks';
import {
  NUM_RESULTS_PER_PAGE,
} from './constants';
import SearchProgram from './SearchProgram';
import SearchCourse from './SearchCourse';
import { ContentHighlights } from './content-highlights';
import { features } from '../../config';

import { IntegrationWarningModal } from '../integration-warning-modal';
import { EnterpriseOffersBalanceAlert } from '../enterprise-user-subsidy';
import SearchPathway from './SearchPathway';
import PathwayModal from '../pathway/PathwayModal';
import SearchAcademy from './SearchAcademy';
import AssignmentsOnlyEmptyState from './AssignmentsOnlyEmptyState';
import { EVENTS, isExperimentVariant, pushEvent } from '../../utils/optimizely';
import {
  useIsAssignmentsOnlyLearner,
  useEnterpriseCustomer,
  useEnterpriseOffers,
  useCanOnlyViewHighlights,
} from '../app/data';
import { useAlgoliaSearch } from '../../utils/hooks';
import useEnterpriseFeatures from '../hooks/useEnterpriseFeatures';
import SearchResultsContainer from './SearchResultsContainer';

export const sendPushEvent = (isPreQueryEnabled, courseKeyMetadata) => {
  if (isPreQueryEnabled) {
    pushEvent(EVENTS.PREQUERY_SUGGESTION_CLICK, { courseKeyMetadata });
  } else {
    pushEvent(EVENTS.SEARCH_SUGGESTION_CLICK, { courseKeyMetadata });
  }
};

function useSearchPathwayModal() {
  const [isLearnerPathwayModalOpen, openLearnerPathwayModal, close] = useToggle(false);
  const { pathwayUUID } = useParams();
  // If a pathwayUUID exists, open the pathway modal.
  useEffect(() => {
    if (pathwayUUID) {
      openLearnerPathwayModal();
    }
  }, [openLearnerPathwayModal, pathwayUUID]);

  return {
    pathwayUUID,
    isLearnerPathwayModalOpen,
    closePathwayModal: close,
  };
}

const Search = () => {
  const config = getConfig();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const enterpriseFeatures = useEnterpriseFeatures();
  const intl = useIntl();
  const navigate = useNavigate();

  const { refinements } = useContext(SearchContext);
  const { filters } = useDefaultSearchFilters();
  const [searchClient, searchIndex] = useAlgoliaSearch(config);

  // Flag to toggle highlights visibility
  const { data: canOnlyViewHighlightSets } = useCanOnlyViewHighlights();
  const isAssignmentOnlyLearner = useIsAssignmentsOnlyLearner();
  const {
    hasLowEnterpriseOffersBalance,
    hasNoEnterpriseOffersBalance,
    canEnrollWithEnterpriseOffers,
  } = useEnterpriseOffers();
  const shouldDisplayBalanceAlert = hasNoEnterpriseOffersBalance || hasLowEnterpriseOffersBalance;

  const {
    pathwayUUID,
    isLearnerPathwayModalOpen,
    closePathwayModal,
  } = useSearchPathwayModal();

  const isExperimentVariation = isExperimentVariant(
    config.PREQUERY_SEARCH_EXPERIMENT_ID,
    config.PREQUERY_SEARCH_EXPERIMENT_VARIANT_ID,
  );

  const PAGE_TITLE = intl.formatMessage({
    id: 'enterprise.search.page.title',
    defaultMessage: 'Search Courses and Programs - {enterpriseName}',
    description: 'Title for the enterprise search page.',
  }, {
    enterpriseName: enterpriseCustomer.name,
  });
  const HEADER_TITLE = intl.formatMessage({
    id: 'enterprise.search.page.header.title',
    defaultMessage: 'Search Courses and Programs',
    description: 'Title for the enterprise search page header.',
  });

  // If learner only has content assignments available, show the assignments-only empty state.
  if (isAssignmentOnlyLearner) {
    return (
      <>
        <Helmet title={PAGE_TITLE} />
        <AssignmentsOnlyEmptyState />
      </>
    );
  }

  const { content_type: contentType } = refinements;
  const hasRefinements = Object.keys(refinements).filter(refinement => refinement !== 'showAll').length > 0 && (contentType !== undefined ? contentType.length > 0 : true);

  const isPreQueryEnabled = enterpriseFeatures?.featurePrequerySearchSuggestions
    && isExperimentVariation;

  const optimizelySuggestionClickHandler = (courseKey) => {
    // Programs pass in a list of keys. Optimizely does not accept array values
    // so we are joining the items in the array.
    const courseKeyMetadata = Array.isArray(courseKey) ? courseKey.join(', ') : courseKey;
    sendPushEvent(isPreQueryEnabled, courseKeyMetadata);
  };

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <InstantSearch
        indexName={config.ALGOLIA_INDEX_NAME}
        searchClient={searchClient}
      >
        <Configure facetingAfterDistinct filters={filters} />
        {contentType?.length > 0 && (
          <Configure
            hitsPerPage={NUM_RESULTS_PER_PAGE}
            filters={`content_type:${contentType[0]} AND ${filters}`}
            clickAnalytics
          />
        )}
        {canOnlyViewHighlightSets === false && (
          <div className="search-header-wrapper">
            <SearchHeader
              containerSize="lg"
              headerTitle={features.ENABLE_PROGRAMS ? HEADER_TITLE : ''}
              index={searchIndex}
              filters={filters}
              enterpriseConfig={enterpriseCustomer}
              optimizelySuggestionClickHandler={optimizelySuggestionClickHandler}
              isPreQueryEnabled={isPreQueryEnabled}
            />
          </div>
        )}
        <PathwayModal
          learnerPathwayUuid={pathwayUUID}
          isOpen={isLearnerPathwayModalOpen}
          onClose={() => {
            navigate(`/${enterpriseCustomer.slug}/search`);
            closePathwayModal();
          }}
        />
        {canEnrollWithEnterpriseOffers && shouldDisplayBalanceAlert && (
          <EnterpriseOffersBalanceAlert hasNoEnterpriseOffersBalance={hasNoEnterpriseOffersBalance} />
        )}

        {/* No content type refinement  */}
        {(contentType === undefined || contentType.length === 0) && (
          <Stack className="my-5" gap={5}>
            {!hasRefinements && <ContentHighlights />}
            {canOnlyViewHighlightSets === false && enterpriseCustomer.enableAcademies && <SearchAcademy />}
            {features.ENABLE_PATHWAYS && (canOnlyViewHighlightSets === false) && <SearchPathway filter={filters} />}
            {features.ENABLE_PROGRAMS && (canOnlyViewHighlightSets === false) && <SearchProgram filter={filters} />}
            {canOnlyViewHighlightSets === false && <SearchCourse filter={filters} /> }
          </Stack>
        )}
        {/* refinement with a content type */}
        {contentType?.length > 0 && <SearchResultsContainer contentType={contentType[0]} />}
      </InstantSearch>
      <IntegrationWarningModal isEnabled={enterpriseCustomer.showIntegrationWarning} />
    </>
  );
};

export default Search;
