import { SEARCH_FACET_FILTERS } from '@edx/frontend-enterprise-catalog-search';
import { features } from '../../config';

export const NUM_RESULTS_PER_PAGE = 24;
export const CONTENT_TYPE_COURSE = 'course';
export const CONTENT_TYPE_PROGRAM = 'program';
export const CONTENT_TYPE_PATHWAY = 'learnerpathway';
export const NUM_RESULTS_PROGRAM = 4;
export const NUM_RESULTS_PATHWAY = 4;
export const NUM_RESULTS_COURSE = 20;
export const COURSE_TITLE = 'Courses';
export const RECOMMENDED_COURSES_TITLE = 'Recommended for you';
export const RECOMMENDED_COURSES_SUBTITLE = 'Enroll in courses selected for you by your organization. ';
export const PROGRAM_TITLE = 'Programs';
export const PATHWAY_TITLE = 'Pathways';
export const HEADER_TITLE = 'Search Courses and Programs';
export const SEARCH_TRACKING_NAME = 'learner_portal';

const OVERRIDE_FACET_FILTERS = [];
if (features.PROGRAM_TYPE_FACET) {
  const PROGRAM_TYPE_FACET_OVERRIDE = {
    overrideSearchKey: 'title',
    overrideSearchValue: 'Program',
    updatedFacetFilterValue: {
      attribute: 'program_type',
      title: 'Program',
      isSortedAlphabetical: true,
      typeaheadOptions: {
        placeholder: 'Find a program...',
        ariaLabel: 'Type to find a program',
        minLength: 3,
      },
    },
  };
  OVERRIDE_FACET_FILTERS.push(PROGRAM_TYPE_FACET_OVERRIDE);
}

OVERRIDE_FACET_FILTERS.forEach(({ overrideSearchKey, overrideSearchValue, updatedFacetFilterValue }) => {
  SEARCH_FACET_FILTERS.find((facetFilter, index) => {
    if (facetFilter[overrideSearchKey] === overrideSearchValue) {
      SEARCH_FACET_FILTERS[index] = updatedFacetFilterValue;
      return true;
    }
    return false;
  });
});

export { SEARCH_FACET_FILTERS };
