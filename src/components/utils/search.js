import {
  ACADEMY_TITLE,
  CONTENT_TYPE_COURSE,
  CONTENT_TYPE_PATHWAY,
  CONTENT_TYPE_PROGRAM,
  CONTENT_TYPE_VIDEO,
  COURSE_TITLE,
  NUM_RESULTS_ACADEMY,
  NUM_RESULTS_COURSE,
  NUM_RESULTS_PATHWAY,
  NUM_RESULTS_PROGRAM,
  NUM_RESULTS_VIDEO,
  PATHWAY_TITLE,
  PROGRAM_TITLE,
  VIDEO_TITLE,
} from '../search/constants';
import SearchCourseCard from '../search/SearchCourseCard';
import SearchProgramCard from '../search/SearchProgramCard';
import SearchPathwayCard from '../pathway/SearchPathwayCard';
import SearchAcademyCard from '../academies/SearchAcademyCard';
import SearchVideoCard from '../search/SearchVideoCard';

export const getContentTypeFromTitle = (title) => {
  switch (title) {
    case PROGRAM_TITLE:
      return CONTENT_TYPE_PROGRAM;
    case COURSE_TITLE:
      return CONTENT_TYPE_COURSE;
    case PATHWAY_TITLE:
      return CONTENT_TYPE_PATHWAY;
    case VIDEO_TITLE:
      return CONTENT_TYPE_VIDEO;
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
    case VIDEO_TITLE:
      return SearchVideoCard;
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
    case ACADEMY_TITLE:
      return NUM_RESULTS_ACADEMY;
    case VIDEO_TITLE:
      return NUM_RESULTS_VIDEO;
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
    case ACADEMY_TITLE:
      return SearchAcademyCard.Skeleton;
    case VIDEO_TITLE:
      return SearchVideoCard.Skeleton;
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
    messageTitle: `An error occurred while finding ${lowerCaseTitle} that match your search.`,
    messageContent: 'Please try again later.',
  };
};
