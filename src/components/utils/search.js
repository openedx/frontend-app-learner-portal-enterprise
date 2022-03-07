import {
  CONTENT_TYPE_COURSE, CONTENT_TYPE_PATHWAY,
  CONTENT_TYPE_PROGRAM,
  COURSE_TITLE,
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

export const getHitCardFromTitle = (title) => {
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
