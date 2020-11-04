export const SHOW_ALL_NAME = 'showAll';

export const SEARCH_FACET_FILTERS = [
  {
    attribute: 'subjects',
    title: 'Subject',
  },
  {
    attribute: 'partners.name',
    title: 'Partner',
    isSortedAlphabetical: true,
  },
  {
    attribute: 'programs',
    title: 'Program',
  },
  {
    attribute: 'level_type',
    title: 'Level',
  },
  {
    attribute: 'availability',
    title: 'Availability',
  },
];

export const BOOLEAN_FILTERS = [SHOW_ALL_NAME];
export const QUERY_PARAM_FOR_SEARCH_QUERY = 'q';
export const QUERY_PARAM_FOR_PAGE = 'page';
export const QUERY_PARAM_FOR_FEATURE_FLAGS = 'features';
export const QUERY_PARAMS_TO_IGNORE = [
  QUERY_PARAM_FOR_SEARCH_QUERY,
  QUERY_PARAM_FOR_PAGE,
  QUERY_PARAM_FOR_FEATURE_FLAGS,
  SHOW_ALL_NAME,
];
export const NUM_CURRENT_REFINEMENTS_TO_DISPLAY = 3;
export const NUM_RESULTS_PER_PAGE = 24;

export const NO_OPTIONS_FOUND = 'No options found.';
