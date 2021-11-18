export const DROPDOWN_OPTION_CHANGE_CAREERS = 'I want to change careers';
export const DROPDOWN_OPTION_GET_PROMOTED = 'I want to get promoted';
export const DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE = 'I want to improve at my current role';
export const DROPDOWN_OPTION_OTHER = 'Other';
export const GOAL_DROPDOWN_DEFAULT_OPTION = 'Select a Goal';

export const JOB_ATTRIBUTE_NAME = 'name';

export const SKILLS_FACET = {
  attribute: 'skill_names',
  title: 'Skills',
  facetValueType: 'array',
  typeaheadOptions: {
    placeholder: 'Find a skill...',
    ariaLabel: 'Type to find a skill',
    minLength: 3,
  },
};

export const CURRENT_JOB_FACET = {
  attribute: JOB_ATTRIBUTE_NAME,
  customAttribute: 'current_job',
  title: 'Current job title',
  facetValueType: 'single-item',
  typeaheadOptions: {
    placeholder: 'Find a current job...',
    ariaLabel: 'Type to find a current job',
    minLength: 3,
  },
};

export const DESIRED_JOB_FACET = {
  attribute: JOB_ATTRIBUTE_NAME,
  title: 'Desired job title',
  typeaheadOptions: {
    placeholder: 'Find a job...',
    ariaLabel: 'Type to find a job',
    minLength: 3,
  },
};

export const JOBS_ERROR_ALERT_MESSAGE = 'An error occured while fetching your selected job. Please try again later.';
export const COURSES_ERROR_ALERT_MESSAGE = 'An error occured while fetching courses. Please try again later.';
export const NO_COURSES_ALERT_MESSAGE = 'No courses were found. Please search for another job, or click see more courses.';

export const STEP1 = 'skills-search';
export const STEP2 = 'recommended-courses';

export const SKILL_NAME_CUTOFF_LIMIT = 50;
export const MAX_VISIBLE_SKILLS_CARD = 6;
