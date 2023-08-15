export const DROPDOWN_OPTION_CHANGE_CAREERS = 'I want to change careers';
export const DROPDOWN_OPTION_CHANGE_CAREERS_LABEL = 'change_careers';
export const DROPDOWN_OPTION_GET_PROMOTED = 'I want to get promoted';
export const DROPDOWN_OPTION_GET_PROMOTED_LABEL = 'get_promoted';
export const DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE = 'I want to improve at my current role';
export const DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE_LABEL = 'improve_current_role';
export const DROPDOWN_OPTION_OTHER = 'Other';
export const DROPDOWN_OPTION_OTHER_LABEL = 'other';
export const GOAL_DROPDOWN_DEFAULT_OPTION = 'Select a Goal';
export const INDUSTRY_DROPDOWN_DEFAULT_OPTION = 'Not Specified';

export const JOB_ATTRIBUTE_NAME = 'name';
export const INDUSTRY_ATTRIBUTE_NAME = 'industry_names';

export const INDUSTRY_FACET = {
  attribute: INDUSTRY_ATTRIBUTE_NAME,
  title: 'Industry I belong to',
  facetValueType: 'single-item',
  typeaheadOptions: {
    placeholder: 'Find a an industry...',
    ariaLabel: 'Type to find an industry',
    minLength: 3,
  },
};

export const CURRENT_JOB_FACET = {
  attribute: JOB_ATTRIBUTE_NAME,
  customAttribute: 'current_job',
  title: 'I am currently',
  facetValueType: 'single-item',
  typeaheadOptions: {
    placeholder: 'Find a current job...',
    ariaLabel: 'Type to find a current job',
    minLength: 3,
  },
};

export const DESIRED_JOB_FACET = {
  attribute: JOB_ATTRIBUTE_NAME,
  title: 'I\'m interested in careers similar to',
  typeaheadOptions: {
    placeholder: 'Find a job...',
    ariaLabel: 'Type to find a job',
    minLength: 3,
  },
};

export const JOBS_ERROR_ALERT_MESSAGE = 'An error occured while fetching your selected job. Please try again later.';
export const COURSES_ERROR_ALERT_MESSAGE = 'An error occured while fetching courses. Please try again later.';
export const NO_COURSES_ALERT_MESSAGE = 'No courses were found. Please search for another job, or click see more courses.';
export const NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS = 'No courses were found. Please search for another job or skills.';
export const NO_PROGRAMS_ALERT_MESSAGE = 'No programs were found. Please search for another job, or click see more courses.';

export const STEP1 = 'skills-search';
export const STEP2 = 'courses-with-jobs';
export const STEP3 = 'courses-with-skills';

export const SKILL_NAME_CUTOFF_LIMIT = 50;

export const NOT_AVAILABLE = 'N/A';
export const MAX_VISIBLE_SKILLS_COURSE = 6;
export const MAX_VISIBLE_SKILLS_PROGRAM = 3;

export const SKILLS_QUIZ_SEARCH_PAGE_MESSAGE = 'Let edX be your guide. We combine the educational expertise of the world\'s leading institutions with labor market data to find the right course(s) and program(s) to help you reach your learning and professional goals.';
export const HITS_PER_PAGE = 500;
export const LOADING_NO_OF_CARDS = 9;

export const JOB_DESCRIPTION_DISCLAIMER = 'This job description has been created by an artificial intelligence, and should be reviewed carefully.';

export const JOB_SOURCE_COURSE_SKILL = 'course_skill';
export const JOB_SOURCE_INDUSTRY = 'industry';

export const JOB_FILTERS = {
  JOB_SOURCE_COURSE_SKILL: `job_sources:${JOB_SOURCE_COURSE_SKILL}`,
  JOB_SOURCE_INDUSTRY: `job_sources:${JOB_SOURCE_INDUSTRY}`,
};
