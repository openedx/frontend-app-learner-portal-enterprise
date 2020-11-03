export const FREE_ALL_ATTRIBUTE = 'showAll';
export const SHOW_ALL_NAME = 'showAll';
export const FREE_TO_ME_NAME = 'freeToMe';

export const SEARCH_FACET_FILTERS = [
  {
    attribute: 'subjects',
    title: 'Subject',
    name: 'subjects',
  },
  {
    attribute: 'partners.name',
    title: 'Partner',
    isSortedAlphabetical: true,
    name: 'partners.name',
  },
  {
    attribute: 'programs',
    title: 'Program',
    name: 'programs',
  },
  {
    attribute: 'level_type',
    title: 'Level',
    name: 'level_type',
  },
  {
    attribute: 'availability',
    title: 'Availability',
    name: 'availability',
  },
];

export const NON_FACET_FILTERS = [FREE_ALL_ATTRIBUTE];

export const QUERY_PARAM_FOR_SEARCH_QUERY = 'q';
export const QUERY_PARAM_FOR_PAGE = 'page';
export const QUERY_PARAM_FOR_FEATURE_FLAGS = 'features';
export const QUERY_PARAMS_TO_IGNORE = [
  QUERY_PARAM_FOR_SEARCH_QUERY,
  QUERY_PARAM_FOR_PAGE,
  QUERY_PARAM_FOR_FEATURE_FLAGS,
  FREE_ALL_ATTRIBUTE,
];
export const NUM_CURRENT_REFINEMENTS_TO_DISPLAY = 3;
export const NUM_RESULTS_PER_PAGE = 24;

export const NO_OPTIONS_FOUND = 'No options found.';
