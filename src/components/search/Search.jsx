import React, {
  useContext, useEffect,
} from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchHeader, SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { useToggle, Stack } from '@edx/paragon';

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
import { ContentHighlights } from './content-highlights';
import { features } from '../../config';

import { IntegrationWarningModal } from '../integration-warning-modal';
import { EnterpriseOffersBalanceAlert, UserSubsidyContext } from '../enterprise-user-subsidy';
import SearchPathway from './SearchPathway';
import SearchPathwayCard from '../pathway/SearchPathwayCard';
import { SUBSIDY_TYPE, SubsidyRequestsContext } from '../enterprise-subsidy-requests';
import PathwayModal from '../pathway/PathwayModal';
import { useEnterpriseCuration } from './content-highlights/data';
import SearchAcademy from './SearchAcademy';
import AssignmentsOnlyEmptyState from './AssignmentsOnlyEmptyState';
import { LICENSE_STATUS } from '../enterprise-user-subsidy/data/constants';
import { POLICY_TYPES } from '../enterprise-user-subsidy/enterprise-offers/data/constants';
import AuthenticatedPageContext from '../app/AuthenticatedPageContext';
import { useAlgoliaSearch } from '../../utils/hooks';

const Search = () => {
  const config = getConfig();
  const { pathwayUUID } = useParams();
  const history = useHistory();
  const { refinements } = useContext(SearchContext);
  const [isLearnerPathwayModalOpen, openLearnerPathwayModal, onClose] = useToggle(false);
  const { enterpriseConfig, algolia } = useContext(AppContext);
  const { showRecommendCourses, hideRecommendCourses } = useContext(AuthenticatedPageContext);
  const {
    subscriptionPlan,
    subscriptionLicense,
    couponCodes: { couponCodes, couponCodesCount },
    enterpriseOffers,
    hasCurrentEnterpriseOffers,
    canEnrollWithEnterpriseOffers,
    hasLowEnterpriseOffersBalance,
    hasNoEnterpriseOffersBalance,
    redeemableLearnerCreditPolicies,
  } = useContext(UserSubsidyContext);
  const {
    catalogsForSubsidyRequests,
    requestsBySubsidyType,
  } = useContext(SubsidyRequestsContext);
  const searchCatalogs = useSearchCatalogs({
    subscriptionPlan,
    subscriptionLicense,
    couponCodes,
    enterpriseOffers,
    catalogsForSubsidyRequests,
    redeemableLearnerCreditPolicies,
  });
  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    searchCatalogs,
  });

  const licenseRequests = requestsBySubsidyType[SUBSIDY_TYPE.LICENSE];
  const couponCodeRequests = requestsBySubsidyType[SUBSIDY_TYPE.COUPON];

  // Flag to toggle highlights visibility
  const enterpriseUUID = enterpriseConfig.uuid;
  const { enterpriseCuration: { canOnlyViewHighlightSets } } = useEnterpriseCuration(enterpriseUUID);

  const [, courseIndex] = useAlgoliaSearch(config, config.ALGOLIA_INDEX_NAME);

  // If a pathwayUUID exists, open the pathway modal.
  useEffect(() => {
    if (pathwayUUID) {
      openLearnerPathwayModal();
    }
  }, [openLearnerPathwayModal, pathwayUUID]);

  const PAGE_TITLE = `${HEADER_TITLE} - ${enterpriseConfig.name}`;

  // Determine whether learner has only content assignments available to them, based on the presence of:
  // - active content assignments
  // - no auto-applied budgets
  // - no current enterprise offers
  // - no active license or license requests
  // - no assigned codes or code requests
  const hasActiveLicense = subscriptionPlan && subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED;
  const hasActiveLicenseOrLicenseRequest = hasActiveLicense || licenseRequests.length > 0;
  const hasAssignedCodesOrCodeRequests = couponCodesCount > 0 || couponCodeRequests.length > 0;
  const hasAutoAppliedLearnerCreditPolicies = redeemableLearnerCreditPolicies?.redeemablePolicies.filter(
    policy => policy.policyType !== POLICY_TYPES.ASSIGNED_CREDIT,
  ).length > 0;
  const hasContentAssignmentsOnly = !!(
    redeemableLearnerCreditPolicies?.learnerContentAssignments.hasActiveAssignments
    && !hasCurrentEnterpriseOffers
    && !hasActiveLicenseOrLicenseRequest
    && !hasAssignedCodesOrCodeRequests
    && !hasAutoAppliedLearnerCreditPolicies
  );

  useEffect(() => {
    if (hasContentAssignmentsOnly) {
      hideRecommendCourses();
    } else {
      showRecommendCourses();
    }
  }, [showRecommendCourses, hideRecommendCourses, hasContentAssignmentsOnly]);

  // If learner only has content assignments available, show the assignments-only empty state.
  if (hasContentAssignmentsOnly) {
    return (
      <>
        <Helmet title={PAGE_TITLE} />
        <AssignmentsOnlyEmptyState />
      </>
    );
  }

  const shouldDisplayBalanceAlert = hasNoEnterpriseOffersBalance || hasLowEnterpriseOffersBalance;

  const { content_type: contentType } = refinements;
  const hasRefinements = Object.keys(refinements).filter(refinement => refinement !== 'showAll').length > 0 && (contentType !== undefined ? contentType.length > 0 : true);

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
        {canOnlyViewHighlightSets === false && (
          <div className="search-header-wrapper">
            <SearchHeader
              containerSize="lg"
              headerTitle={features.ENABLE_PROGRAMS ? HEADER_TITLE : ''}
              index={courseIndex}
              filters={filters}
              enterpriseConfig={enterpriseConfig}
            />
          </div>
        )}
        <PathwayModal
          learnerPathwayUuid={pathwayUUID}
          isOpen={isLearnerPathwayModalOpen}
          onClose={() => {
            history.push(`/${enterpriseConfig.slug}/search`);
            onClose();
          }}
        />
        {canEnrollWithEnterpriseOffers && shouldDisplayBalanceAlert && (
          <EnterpriseOffersBalanceAlert hasNoEnterpriseOffersBalance={hasNoEnterpriseOffersBalance} />
        )}
        {(contentType === undefined || contentType.length === 0) && (
          <Stack className="my-5" gap={5}>
            {!hasRefinements && <ContentHighlights />}
            {canOnlyViewHighlightSets === false && <SearchAcademy />}
            {features.ENABLE_PATHWAYS && (canOnlyViewHighlightSets === false) && <SearchPathway filter={filters} />}
            {features.ENABLE_PROGRAMS && (canOnlyViewHighlightSets === false) && <SearchProgram filter={filters} />}
            {canOnlyViewHighlightSets === false && <SearchCourse filter={filters} /> }
          </Stack>
        )}

        {contentType?.length > 0 && contentType[0] === CONTENT_TYPE_PATHWAY && (
          <SearchResults className="py-5" hitComponent={SearchPathwayCard} title={PATHWAY_TITLE} contentType={CONTENT_TYPE_PATHWAY} />
        )}

        {contentType?.length > 0 && contentType[0] === CONTENT_TYPE_PROGRAM && (
          <SearchResults className="py-5" hitComponent={SearchProgramCard} title={PROGRAM_TITLE} contentType={CONTENT_TYPE_PROGRAM} />
        )}

        {contentType?.length > 0 && contentType[0] === CONTENT_TYPE_COURSE && (
          <SearchResults className="py-5" hitComponent={SearchCourseCard} title={COURSE_TITLE} contentType={CONTENT_TYPE_COURSE} />
        )}
      </InstantSearch>
      <IntegrationWarningModal isOpen={enterpriseConfig.showIntegrationWarning} />
    </>
  );
};

export default Search;
