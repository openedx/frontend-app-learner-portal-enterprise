import PropTypes from 'prop-types';
import { Configure, Index } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { useIntl } from '@edx/frontend-platform/i18n';
import { COURSE_TITLE, NUM_RESULTS_COURSE } from './constants';
import { SEARCH_INDEX_IDS } from '../../constants';
import SearchResults from './SearchResults';
import SearchCourseCard from './SearchCourseCard';

/**
 * Renders the course-specific Algolia search results.
 *
 * @param {{ filter: string }} props
 * @param {string} props.filter - A fully constructed Algolia filter string that already includes the
 * `content_type:course` condition. This filter is applied to restrict results to relevant courses.
 *
 * @example
 * <SearchCourse filter="content_type:course AND level:beginner" />
 */
const SearchCourse = ({ filter }) => {
  const config = getConfig();
  const intl = useIntl();
  return (
    <Index indexName={config.ALGOLIA_INDEX_NAME} indexId={SEARCH_INDEX_IDS.COURSE}>
      <Configure
        hitsPerPage={NUM_RESULTS_COURSE}
        filters={filter}
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
        componentId={SEARCH_INDEX_IDS.COURSE}
      />
    </Index>
  );
};

SearchCourse.propTypes = {
  filter: PropTypes.string.isRequired,
};

export default SearchCourse;
