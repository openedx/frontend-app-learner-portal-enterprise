import React from 'react';
import PropTypes from 'prop-types';
import { Configure, Index } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { useIntl } from '@edx/frontend-platform/i18n';
import { NUM_RESULTS_COURSE, CONTENT_TYPE_COURSE, COURSE_TITLE } from './constants';
import SearchResults from './SearchResults';
import SearchCourseCard from './SearchCourseCard';

const SearchCourse = ({ filter }) => {
  const defaultFilter = `content_type:${CONTENT_TYPE_COURSE} AND ${filter}`;
  const config = getConfig();
  const intl = useIntl();

  return (
    <Index indexName={config.ALGOLIA_INDEX_NAME} indexId="search-courses">
      <Configure
        hitsPerPage={NUM_RESULTS_COURSE}
        filters={defaultFilter}
        clickAnalytics
      />
      <SearchResults
        hitComponent={SearchCourseCard}
        title={COURSE_TITLE}
        translatedTitle={
          intl.formatMessage({
            id: 'enterprise.search.page.course.section.translated.title',
            defaultMessage: 'Courses',
            description: 'Translated title for the enterprise search page course section.',
          })
        }
      />
    </Index>
  );
};

SearchCourse.propTypes = {
  filter: PropTypes.string.isRequired,
};

export default SearchCourse;
