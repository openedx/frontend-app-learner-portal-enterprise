import {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useParams, useMatch } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { logInfo } from '@edx/frontend-platform/logging';

import { useEnterpriseCuration } from '../../search/content-highlights/data';

/**
 * Keeps track of whether the enterprise banner should include the "Recommend courses for me" button.
 * @returns {Object} An object containing the current value of `shouldRecommendCourses` and functions to update it.
 */
export default function useRecommendCoursesForMe() {
  const { enterpriseSlug } = useParams();
  const { enterpriseConfig } = useContext(AppContext);

  const routeMatch = useMatch(`/${enterpriseSlug}/search`);
  const [shouldRecommendCourses, setShouldRecommendCourses] = useState(false);

  const { enterpriseCuration: { canOnlyViewHighlightSets } } = useEnterpriseCuration(enterpriseConfig?.uuid);

  const showRecommendCourses = useCallback(() => {
    // only show the recommend courses button if the current route is the search page
    // and the user is not restricted to only viewing highlight sets.
    if (routeMatch && !canOnlyViewHighlightSets) {
      setShouldRecommendCourses(true);
    } else {
      logInfo('Cannot show recommend courses button because the current route is not the search page.');
    }
  }, [routeMatch, canOnlyViewHighlightSets]);

  const hideRecommendCourses = useCallback(() => {
    setShouldRecommendCourses(false);
  }, []);

  return useMemo(() => ({
    shouldRecommendCourses,
    showRecommendCourses,
    hideRecommendCourses,
  }), [
    shouldRecommendCourses,
    showRecommendCourses,
    hideRecommendCourses,
  ]);
}
