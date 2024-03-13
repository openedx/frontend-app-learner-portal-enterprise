import React, { memo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  CONTENT_TYPE_COURSE,
  CONTENT_TYPE_PATHWAY,
  CONTENT_TYPE_PROGRAM, COURSE_TITLE,
  PATHWAY_TITLE,
  PROGRAM_TITLE,
} from './constants';
import SearchResults from './SearchResults';
import SearchPathwayCard from '../pathway/SearchPathwayCard';
import SearchProgramCard from './SearchProgramCard';
import SearchCourseCard from './SearchCourseCard';

const SearchResultsContainer = ({ contentType }) => {
  const intl = useIntl();

  if (contentType === CONTENT_TYPE_PATHWAY) {
    return (
      <SearchResults
        className="py-5"
        hitComponent={SearchPathwayCard}
        title={PATHWAY_TITLE}
        translatedTitle={intl.formatMessage({
          id: 'enterprise.search.page.show.more.pathway.section.translated.title',
          defaultMessage: 'Pathways',
          description: 'Translated title for the enterprise search page show all pathways section',
        })}
        contentType={CONTENT_TYPE_PATHWAY}
      />
    );
  }
  if (contentType === CONTENT_TYPE_PROGRAM) {
    return (
      <SearchResults
        className="py-5"
        hitComponent={SearchProgramCard}
        title={PROGRAM_TITLE}
        translatedTitle={intl.formatMessage({
          id: 'enterprise.search.page.show.more.program.section.translated.title',
          defaultMessage: 'Programs',
          description: 'Translated title for the enterprise search page show all programs section.',
        })}
        contentType={CONTENT_TYPE_PROGRAM}
      />
    );
  }
  if (contentType === CONTENT_TYPE_COURSE) {
    return (
      <SearchResults
        className="py-5"
        hitComponent={SearchCourseCard}
        title={COURSE_TITLE}
        translatedTitle={intl.formatMessage({
          id: 'enterprise.search.page.show.more.course.section.translated.title',
          defaultMessage: 'Courses',
          description: 'Translated title for the enterprise search page show all courses section.',
        })}
        contentType={CONTENT_TYPE_COURSE}
      />
    );
  }
  return null;
};

export const MemoizedSearchResultsContainer = memo(SearchResultsContainer);
