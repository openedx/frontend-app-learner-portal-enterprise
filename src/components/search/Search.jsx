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
  CONTENT_TYPE_COURSE,
  CONTENT_TYPE_PROGRAM,
  COURSE_TITLE,
  PROGRAM_TITLE,
  CONTENT_TYPE_PATHWAY,
  PATHWAY_TITLE,
} from './constants';
import SearchProgram from './SearchProgram';
import SearchCourse from './SearchCourse';
import SearchCourseCard from './SearchCourseCard';
import SearchProgramCard from './SearchProgramCard';
import SearchResults from './SearchResults';
import { ContentHighlights } from './content-highlights';
import { features } from '../../config';

import { IntegrationWarningModal } from '../integration-warning-modal';
import { EnterpriseOffersBalanceAlert } from '../enterprise-user-subsidy';
import SearchPathway from './SearchPathway';
import SearchPathwayCard from '../pathway/SearchPathwayCard';
import PathwayModal from '../pathway/PathwayModal';
import { useEnterpriseCuration } from './content-highlights/data';
import SearchAcademy from './SearchAcademy';
import AssignmentsOnlyEmptyState from './AssignmentsOnlyEmptyState';
import { EVENTS, isExperimentVariant, pushEvent } from '../../utils/optimizely';
import { useEnterpriseCustomer, useEnterpriseOffers } from '../hooks';
import { useIsAssignmentsOnlyLearner } from '../app/data';
import { useAlgoliaSearch } from '../../utils/hooks';

export const sendPushEvent = (isPreQueryEnabled, courseKeyMetadata) => {
  if (isPreQueryEnabled) {
    pushEvent(EVENTS.PREQUERY_SUGGESTION_CLICK, { courseKeyMetadata });
  } else {
    pushEvent(EVENTS.SEARCH_SUGGESTION_CLICK, { courseKeyMetadata });
  }
};

const Search = () => {
  const config = getConfig();
  const enterpriseCustomer = useEnterpriseCustomer();
  const intl = useIntl();

  const [isLearnerPathwayModalOpen, openLearnerPathwayModal, onClose] = useToggle(false);
  const { pathwayUUID } = useParams();
  const navigate = useNavigate();

  const { refinements } = useContext(SearchContext);
  const { filters } = useDefaultSearchFilters();
  const [searchClient, searchIndex] = useAlgoliaSearch(config);

  // Flag to toggle highlights visibility
  const { enterpriseCuration: { canOnlyViewHighlightSets } } = useEnterpriseCuration(enterpriseCustomer.uuid);
  const isAssignmentOnlyLearner = useIsAssignmentsOnlyLearner();
  const {
    hasLowEnterpriseOffersBalance,
    hasNoEnterpriseOffersBalance,
    canEnrollWithEnterpriseOffers,
  } = useEnterpriseOffers();
  const shouldDisplayBalanceAlert = hasNoEnterpriseOffersBalance || hasLowEnterpriseOffersBalance;

  const isExperimentVariation = isExperimentVariant(
    config.PREQUERY_SEARCH_EXPERIMENT_ID,
    config.PREQUERY_SEARCH_EXPERIMENT_VARIANT_ID,
  );

  // If a pathwayUUID exists, open the pathway modal.
  useEffect(() => {
    if (pathwayUUID) {
      openLearnerPathwayModal();
    }
  }, [openLearnerPathwayModal, pathwayUUID]);

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

  const optimizelyPrequerySuggestionClickHandler = (courseKey) => {
    if (isExperimentVariation) {
      pushEvent(EVENTS.PREQUERY_SUGGESTION_CLICK, { courseKey });
    }
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
              optimizelyPrequerySuggestionClickHandler={optimizelyPrequerySuggestionClickHandler}
            />
          </div>
        )}
        <PathwayModal
          learnerPathwayUuid={pathwayUUID}
          isOpen={isLearnerPathwayModalOpen}
          onClose={() => {
            navigate(`/${enterpriseCustomer.slug}/search`);
            onClose();
          }}
        />
        {canEnrollWithEnterpriseOffers && shouldDisplayBalanceAlert && (
          <EnterpriseOffersBalanceAlert hasNoEnterpriseOffersBalance={hasNoEnterpriseOffersBalance} />
        )}
        {(contentType === undefined || contentType.length === 0) && (
          <Stack className="my-5" gap={5}>
            {!hasRefinements && <ContentHighlights />}
            {canOnlyViewHighlightSets === false && enterpriseCustomer.enableAcademies && <SearchAcademy />}
            {features.ENABLE_PATHWAYS && (canOnlyViewHighlightSets === false) && <SearchPathway filter={filters} />}
            {features.ENABLE_PROGRAMS && (canOnlyViewHighlightSets === false) && <SearchProgram filter={filters} />}
            {canOnlyViewHighlightSets === false && <SearchCourse filter={filters} /> }
          </Stack>
        )}

        {contentType?.length > 0 && contentType[0] === CONTENT_TYPE_PATHWAY && (
          <SearchResults
            className="py-5"
            hitComponent={SearchPathwayCard}
            title={PATHWAY_TITLE}
            translatedTitle={intl.formatMessage({
              id: 'enterprise.search.page.show.more.pathway.section.translated.title',
              defaultMessage: 'Pathways',
              description: 'Translated title for the enterprise search page show all pathways section',
            })}
            contentType={CONTENT_TYPE_PATHWAY}
          />
        )}

        {contentType?.length > 0 && contentType[0] === CONTENT_TYPE_PROGRAM && (
          <SearchResults
            className="py-5"
            hitComponent={SearchProgramCard}
            title={PROGRAM_TITLE}
            translatedTitle={intl.formatMessage({
              id: 'enterprise.search.page.show.more.program.section.translated.title',
              defaultMessage: 'Programs',
              description: 'Translated title for the enterprise search page show all programs section.',
            })}
            contentType={CONTENT_TYPE_PROGRAM}
          />
        )}

        {contentType?.length > 0 && contentType[0] === CONTENT_TYPE_COURSE && (
          <SearchResults
            className="py-5"
            hitComponent={SearchCourseCard}
            title={COURSE_TITLE}
            translatedTitle={intl.formatMessage({
              id: 'enterprise.search.page.show.more.course.section.translated.title',
              defaultMessage: 'Courses',
              description: 'Translated title for the enterprise search page show all courses section.',
            })}
            contentType={CONTENT_TYPE_COURSE}
          />
        )}
      </InstantSearch>
      <IntegrationWarningModal isOpen={enterpriseCustomer.showIntegrationWarning} />
    </>
  );
};

export default Search;
