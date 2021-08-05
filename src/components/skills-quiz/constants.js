// eslint-disable-next-line import/prefer-default-export
export const DROPDOWN_OPTION_CHANGE_CAREERS = 'I want to change careers';
export const DROPDOWN_OPTION_GET_PROMOTED = 'I want to get promoted';
export const DROPDOWN_OPTION_CHANGE_ROLE = 'I want to get better at my current role';
export const DROPDOWN_OPTION_OTHER = 'Other';

export const SKILLS_QUIZ_FACET_FILTERS = [
  {
    attribute: 'skill_names',
    title: 'Skills',
    typeaheadOptions: {
      placeholder: 'Find a skill...',
      ariaLabel: 'Type to find a skill',
      minLength: 3,
    },
  },
];

export const JOBS_QUIZ_FACET_FILTERS = {
  attribute: 'skill_names',
  title: 'Search jobs',
  typeaheadOptions: {
    placeholder: 'Find a job...',
    ariaLabel: 'Type to find a job',
    minLength: 3,
  },
};

export const JOBS_ERROR_ALERT_MESSAGE = 'An error occured while fetching your selected job. Please try again later.';
export const STEP1 = 'skills-search';
export const STEP2 = 'review';
