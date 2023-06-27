import {
  CONTENT_TYPE_COURSE, CONTENT_TYPE_PATHWAY,
  CONTENT_TYPE_PROGRAM,
  COURSE_TITLE, NUM_RESULTS_COURSE, NUM_RESULTS_PATHWAY, NUM_RESULTS_PROGRAM,
  PATHWAY_TITLE,
  PROGRAM_TITLE,
} from '../search/constants';
import SearchCourseCard from '../search/SearchCourseCard';
import SearchProgramCard from '../search/SearchProgramCard';
import SearchPathwayCard from '../pathway/SearchPathwayCard';

export const getContentTypeFromTitle = (title) => {
  switch (title) {
    case PROGRAM_TITLE:
      return CONTENT_TYPE_PROGRAM;
    case COURSE_TITLE:
      return CONTENT_TYPE_COURSE;
    case PATHWAY_TITLE:
      return CONTENT_TYPE_PATHWAY;
    default:
      return null;
  }
};

export const getHitComponentFromTitle = (title) => {
  switch (title) {
    case COURSE_TITLE:
      return SearchCourseCard;
    case PROGRAM_TITLE:
      return SearchProgramCard;
    case PATHWAY_TITLE:
      return SearchPathwayCard;
    default:
      return null;
  }
};

export const getNoOfResultsFromTitle = (title) => {
  switch (title) {
    case COURSE_TITLE:
      return NUM_RESULTS_COURSE;
    case PROGRAM_TITLE:
      return NUM_RESULTS_PROGRAM;
    case PATHWAY_TITLE:
      return NUM_RESULTS_PATHWAY;
    default:
      return 0;
  }
};

export const getSkeletonCardFromTitle = (title) => {
  switch (title) {
    case COURSE_TITLE:
      return SearchCourseCard.Skeleton;
    case PROGRAM_TITLE:
      return SearchProgramCard.Skeleton;
    case PATHWAY_TITLE:
      return SearchPathwayCard.Skeleton;
    default:
      return null;
  }
};

export const getNoResultsMessage = (title) => {
  const lowerCaseTitle = title.toLowerCase();
  return {
    messageTitle: `No ${lowerCaseTitle} were found to match your search results.`,
    messageContent: `Check out some popular ${lowerCaseTitle} below.`,
  };
};

export const getSearchErrorMessage = (title) => {
  const lowerCaseTitle = title.toLowerCase();
  return {
    messageTitle: `An error occured while finding ${lowerCaseTitle} that match your search.`,
    messageContent: 'Please try again later.',
  };
};
