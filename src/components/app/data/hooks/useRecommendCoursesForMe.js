import { useMemo } from 'react';
import { useParams, useMatch } from 'react-router-dom';

// import { useEnterpriseCuration } from '../../../search/content-highlights/data';
import useContentHighlightsConfiguration from './useContentHighlightsConfiguration';
// import { determineLearnerHasContentAssignmentsOnly } from '../../../enterprise-user-subsidy/data/utils';
import useEnterpriseCustomerUserSubsidies from './useEnterpriseCustomerUserSubsidies';

/**
 * Keeps track of whether the enterprise banner should include the "Recommend courses for me" button.
 * @returns {Object} An object containing the current value of `shouldRecommendCourses` and functions to update it.
 */
export default function useRecommendCoursesForMe() {
  const { enterpriseSlug } = useParams();
  const isSearchPage = useMatch(`/${enterpriseSlug}/search/*`);
  const { data: contentHighlightsConfiguration } = useContentHighlightsConfiguration();
  const canOnlyViewHighlightSets = !!contentHighlightsConfiguration?.canOnlyViewHighlightSets;

  const { data: subsidies } = useEnterpriseCustomerUserSubsidies();
  console.log('subsidies', subsidies);

  // If user is not on the search page route, or users are restricted to only viewing highlight sets,
  // the "Recommend courses for me" button should not be shown.
  if (!isSearchPage || !canOnlyViewHighlightSets) {
    return {
      shouldRecommendCourses: false,
    };
  }

  // const isAssignmentOnlyLearner = determineLearnerHasContentAssignmentsOnly({
  //   subscriptionPlan: subsidies.subscriptionPlan,
  //   subscriptionLicense,
  //   licenseRequests,
  //   couponCodesCount,
  //   couponCodeRequests,
  //   redeemableLearnerCreditPolicies,
  //   hasCurrentEnterpriseOffers,
  // });

  return {
    shouldRecommendCourses: !false, // isAssignmentOnlyLearner,
  };

  // const showRecommendCourses = useCallback(() => {
  //   // only show the recommend courses button if the current route is the search page
  //   // and the user is not restricted to only viewing highlight sets.
  //   if (routeMatch && !canOnlyViewHighlightSets) {
  //     setShouldRecommendCourses(true);
  //   } else {
  //     logInfo('Cannot show recommend courses button because the current route is not the search page.');
  //   }
  // }, [routeMatch, canOnlyViewHighlightSets]);

  // const hideRecommendCourses = useCallback(() => {
  //   setShouldRecommendCourses(false);
  // }, []);

  // return useMemo(() => ({
  //   shouldRecommendCourses,
  //   showRecommendCourses,
  //   hideRecommendCourses,
  // }), [
  //   shouldRecommendCourses,
  //   showRecommendCourses,
  //   hideRecommendCourses,
  // ]);
}
