import React, { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { useToggle } from '@openedx/paragon';
import { useQuery } from '@tanstack/react-query';
import { useActiveRedeemablePolicies, useEnterpriseCustomer, useSubscriptionLicenses } from '../hooks';
import { queryCouponCodes } from '../app/routes/data';

export const sendPushEvent = (isPreQueryEnabled, courseKeyMetadata) => {
  if (isPreQueryEnabled) {
    pushEvent(EVENTS.PREQUERY_SUGGESTION_CLICK, { courseKeyMetadata });
  } else {
    pushEvent(EVENTS.SEARCH_SUGGESTION_CLICK, { courseKeyMetadata });
  }
};

const Search = () => {
  const config = getConfig();
  console.log(config);
  const enterpriseCustomer = useEnterpriseCustomer();
  const { pathwayUUID } = useParams();
  const navigate = useNavigate();
  const { refinements } = useContext(SearchContext);
  const [isLearnerPathwayModalOpen, openLearnerPathwayModal, onClose] = useToggle(false);
  const { algolia } = useContext(AppContext);
  console.log(enterpriseCustomer);
  // const {
  //   subscriptionPlan,
  //   subscriptionLicense,
  //   couponCodes: { couponCodes },
  //   enterpriseOffers,
  //   canEnrollWithEnterpriseOffers,
  //   hasLowEnterpriseOffersBalance,
  //   hasNoEnterpriseOffersBalance,
  //   redeemableLearnerCreditPolicies,
  // } = useContext(UserSubsidyContext);
  // const {
  //   catalogsForSubsidyRequests,
  // } = useContext(SubsidyRequestsContext);
  // const searchCatalogs = useSearchCatalogs({
  //   subscriptionPlan,
  //   subscriptionLicense,
  //   couponCodes,
  //   enterpriseOffers,
  //   catalogsForSubsidyRequests,
  //   redeemableLearnerCreditPolicies,
  // });
  // const { authenticatedUser } = useContext(AppContext);
  // const { userId } = authenticatedUser;
  // console.log(authenticatedUser);
  // // Customer agreement, subscriptionLicenses - subscriptionPlan
  // const { data: subscriptionsData } = useQuery(querySubscriptions(enterpriseCustomer.uuid));
  // console.log(subscriptionsData);
  //
  const { data: couponCodesData } = useQuery(queryCouponCodes(enterpriseCustomer.uuid));
  console.log(couponCodesData);
  //
  // const { data: offersData } = useQuery(queryEnterpriseLearnerOffers(enterpriseCustomer.uuid));
  // console.log(offersData);
  //
  // const { data: redeemablePoliciesData } = useQuery(queryRedeemablePolicies({ enterpriseUuid: enterpriseCustomer.uuid, lmsUserId: userId }));
  // console.log(redeemablePoliciesData);
  const hi = useActiveRedeemablePolicies();
  console.log(hi);
  const data = useSubscriptionLicenses();
  console.log(data, 'hi');
  // const { filters } = useDefaultSearchFilters({
  //   enterpriseCustomer,
  //   searchCatalogs,
  // });

  // const { filters } = useDefaultSearchFilters({
  //   enterpriseConfig,
  //   searchCatalogs,
  // });
  // const isAssignmentOnlyLearner = useIsAssignmentsOnlyLearner();
  // const intl = useIntl();
  //
  // const isExperimentVariation = isExperimentVariant(
  //   config.PREQUERY_SEARCH_EXPERIMENT_ID,
  //   config.PREQUERY_SEARCH_EXPERIMENT_VARIANT_ID,
  // );
  //
  // // Flag to toggle highlights visibility
  // const enterpriseUUID = enterpriseConfig.uuid;
  // const { enterpriseCuration: { canOnlyViewHighlightSets } } = useEnterpriseCuration(enterpriseUUID);
  //
  // const courseIndex = useMemo(
  //   () => {
  //     const client = algoliasearch(
  //       config.ALGOLIA_APP_ID,
  //       config.ALGOLIA_SEARCH_API_KEY,
  //     );
  //     const cIndex = client.initIndex(config.ALGOLIA_INDEX_NAME);
  //     return cIndex;
  //   },
  //   [config.ALGOLIA_APP_ID, config.ALGOLIA_INDEX_NAME, config.ALGOLIA_SEARCH_API_KEY],
  // );
  //
  // // If a pathwayUUID exists, open the pathway modal.
  // useEffect(() => {
  //   if (pathwayUUID) {
  //     openLearnerPathwayModal();
  //   }
  // }, [openLearnerPathwayModal, pathwayUUID]);
  //
  // const PAGE_TITLE = intl.formatMessage({
  //   id: 'enterprise.search.page.title',
  //   defaultMessage: 'Search Courses and Programs - {entrepriseName}',
  //   description: 'Title for the enterprise search page.',
  // }, {
  //   entrepriseName: enterpriseConfig.name,
  // });
  // const HEADER_TITLE = intl.formatMessage({
  //   id: 'enterprise.search.page.header.title',
  //   defaultMessage: 'Search Courses and Programs',
  //   description: 'Title for the enterprise search page header.',
  // });
  //
  // // If learner only has content assignments available, show the assignments-only empty state.
  // if (isAssignmentOnlyLearner) {
  //   return (
  //     <>
  //       <Helmet title={PAGE_TITLE} />
  //       <AssignmentsOnlyEmptyState />
  //     </>
  //   );
  // }
  //
  // const shouldDisplayBalanceAlert = hasNoEnterpriseOffersBalance || hasLowEnterpriseOffersBalance;
  //
  // const { content_type: contentType } = refinements;
  // const hasRefinements = Object.keys(refinements).filter(refinement => refinement !== 'showAll').length > 0 && (contentType !== undefined ? contentType.length > 0 : true);
  //
  // const optimizelyPrequerySuggestionClickHandler = (courseKey) => {
  //   if (isExperimentVariation) {
  //     pushEvent(EVENTS.PREQUERY_SUGGESTION_CLICK, { courseKey });
  //   }
  // };

  return (
    <>
      <h1>Hey</h1>
      {/* <Helmet title={PAGE_TITLE} /> */}
      {/* <InstantSearch */}
      {/*  indexName={config.ALGOLIA_INDEX_NAME} */}
      {/*  searchClient={algolia.client} */}
      {/* > */}
      {/*  <Configure facetingAfterDistinct filters={filters} /> */}
      {/*  {contentType?.length > 0 && ( */}
      {/*    <Configure */}
      {/*      hitsPerPage={NUM_RESULTS_PER_PAGE} */}
      {/*      filters={`content_type:${contentType[0]} AND ${filters}`} */}
      {/*      clickAnalytics */}
      {/*    /> */}
      {/*  )} */}
      {/*  {canOnlyViewHighlightSets === false && ( */}
      {/*    <div className="search-header-wrapper"> */}
      {/*      <SearchHeader */}
      {/*        containerSize="lg" */}
      {/*        headerTitle={features.ENABLE_PROGRAMS ? HEADER_TITLE : ''} */}
      {/*        index={courseIndex} */}
      {/*        filters={filters} */}
      {/*        enterpriseConfig={enterpriseConfig} */}
      {/*        optimizelyPrequerySuggestionClickHandler={optimizelyPrequerySuggestionClickHandler} */}
      {/*      /> */}
      {/*    </div> */}
      {/*  )} */}
      {/*  <PathwayModal */}
      {/*    learnerPathwayUuid={pathwayUUID} */}
      {/*    isOpen={isLearnerPathwayModalOpen} */}
      {/*    onClose={() => { */}
      {/*      navigate(`/${enterpriseConfig.slug}/search`); */}
      {/*      onClose(); */}
      {/*    }} */}
      {/*  /> */}
      {/*  {canEnrollWithEnterpriseOffers && shouldDisplayBalanceAlert && ( */}
      {/*    <EnterpriseOffersBalanceAlert hasNoEnterpriseOffersBalance={hasNoEnterpriseOffersBalance} /> */}
      {/*  )} */}
      {/*  {(contentType === undefined || contentType.length === 0) && ( */}
      {/*    <Stack className="my-5" gap={5}> */}
      {/*      {!hasRefinements && <ContentHighlights />} */}
      {/*      {canOnlyViewHighlightSets === false && enterpriseConfig.enableAcademies && <SearchAcademy />} */}
      {/*      {features.ENABLE_PATHWAYS && (canOnlyViewHighlightSets === false) && <SearchPathway filter={filters} />} */}
      {/*      {features.ENABLE_PROGRAMS && (canOnlyViewHighlightSets === false) && <SearchProgram filter={filters} />} */}
      {/*      {canOnlyViewHighlightSets === false && <SearchCourse filter={filters} /> } */}
      {/*    </Stack> */}
      {/*  )} */}

      {/*  {contentType?.length > 0 && contentType[0] === CONTENT_TYPE_PATHWAY && ( */}
      {/*    <SearchResults */}
      {/*      className="py-5" */}
      {/*      hitComponent={SearchPathwayCard} */}
      {/*      title={PATHWAY_TITLE} */}
      {/*      translatedTitle={intl.formatMessage({ */}
      {/*        id: 'enterprise.search.page.show.more.pathway.section.translated.title', */}
      {/*        defaultMessage: 'Pathways', */}
      {/*        description: 'Translated title for the enterprise search page show all pathways section', */}
      {/*      })} */}
      {/*      contentType={CONTENT_TYPE_PATHWAY} */}
      {/*    /> */}
      {/*  )} */}

      {/*  {contentType?.length > 0 && contentType[0] === CONTENT_TYPE_PROGRAM && ( */}
      {/*    <SearchResults */}
      {/*      className="py-5" */}
      {/*      hitComponent={SearchProgramCard} */}
      {/*      title={PROGRAM_TITLE} */}
      {/*      translatedTitle={intl.formatMessage({ */}
      {/*        id: 'enterprise.search.page.show.more.program.section.translated.title', */}
      {/*        defaultMessage: 'Programs', */}
      {/*        description: 'Translated title for the enterprise search page show all programs section.', */}
      {/*      })} */}
      {/*      contentType={CONTENT_TYPE_PROGRAM} */}
      {/*    /> */}
      {/*  )} */}

      {/*  {contentType?.length > 0 && contentType[0] === CONTENT_TYPE_COURSE && ( */}
      {/*    <SearchResults */}
      {/*      className="py-5" */}
      {/*      hitComponent={SearchCourseCard} */}
      {/*      title={COURSE_TITLE} */}
      {/*      translatedTitle={intl.formatMessage({ */}
      {/*        id: 'enterprise.search.page.show.more.course.section.translated.title', */}
      {/*        defaultMessage: 'Courses', */}
      {/*        description: 'Translated title for the enterprise search page show all courses section.', */}
      {/*      })} */}
      {/*      contentType={CONTENT_TYPE_COURSE} */}
      {/*    /> */}
      {/*  )} */}
      {/* </InstantSearch> */}
      {/* <IntegrationWarningModal isOpen={enterpriseConfig.showIntegrationWarning} /> */}
    </>
  );
};

export default Search;
