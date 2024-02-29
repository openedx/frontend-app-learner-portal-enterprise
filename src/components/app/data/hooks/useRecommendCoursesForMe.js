import { useMatch, useLocation } from 'react-router-dom';

import useContentHighlightsConfiguration from './useContentHighlightsConfiguration';
import useIsAssignmentsOnlyLearner from './useIsAssignmentsOnlyLearner';

/**
 * Keeps track of whether the enterprise banner should include the "Recommend courses for me" button.
 * @returns {Object} An object containing the current value of `shouldRecommendCourses` and functions to update it.
 */
export default function useRecommendCoursesForMe() {
  const { pathname } = useLocation();
  const isSearchPage = useMatch('/:enterpriseSlug/search/*', pathname);
  const { data: contentHighlightsConfiguration } = useContentHighlightsConfiguration();
  const canOnlyViewHighlightSets = !!contentHighlightsConfiguration?.canOnlyViewHighlightSets;
  const isAssignmentsOnlyLearner = useIsAssignmentsOnlyLearner();

  // If user is not on the search page route, or users are restricted to only viewing highlight sets,
  // the "Recommend courses for me" button should not be shown.
  if (!isSearchPage || canOnlyViewHighlightSets) {
    return {
      shouldRecommendCourses: false,
    };
  }

  // Otherwise, rely on whether the learner only has assignments to determine whether to show the
  // "Recommend courses for me" button.
  return {
    shouldRecommendCourses: !isAssignmentsOnlyLearner,
  };
}
