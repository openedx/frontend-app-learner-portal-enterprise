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

export const QUERY_PARAM_FOR_SEARCH_QUERY = 'q';
export const QUERY_PARAM_FOR_PAGE = 'page';
export const QUERY_PARAMS_TO_IGNORE = [
  QUERY_PARAM_FOR_SEARCH_QUERY,
  QUERY_PARAM_FOR_PAGE,
];
export const NUM_CURRENT_REFINEMENTS_TO_DISPLAY = 3;
export const NUM_RESULTS_PER_PAGE = 24;

export const NO_OPTIONS_FOUND = 'No options found.';
