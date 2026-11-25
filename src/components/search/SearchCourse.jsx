import PropTypes from 'prop-types';
import { Configure, Index } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { useIntl } from '@edx/frontend-platform/i18n';
import { COURSE_TITLE, NUM_RESULTS_COURSE } from './constants';
import { SEARCH_INDEX_IDS } from '../../constants';
import SearchResults from './SearchResults';
import SearchCourseCard from './SearchCourseCard';
import { useEnterpriseFeatures } from '../app/data';
import { isExperimentVariant } from '../../utils/optimizely';

/**
 * Resolves the Algolia index courses are searched against.
 *
 * Defaults to the relevance-sorted primary index. Switches to the recency-sorted
 * ("newest courses first") replica only when BOTH gates pass: (1) the
 * `search_default_sort_newest` enterprise waffle flag is enabled (kill-switch), and
 * (2) the Optimizely "newest" experiment variant is active for this user (A/B bucketing).
 * A configured replica name is also required, so the sort is a safe no-op until ops
 * provisions `ALGOLIA_RECENTLY_RELEASED_REPLICA_INDEX_NAME`.
 */
const useCourseSearchIndexName = () => {
  const config = getConfig();
  const { data: enterpriseFeatures } = useEnterpriseFeatures();
  const recentlyReleasedIndexName = config.ALGOLIA_RECENTLY_RELEASED_REPLICA_INDEX_NAME;
  const newestSortEnabled = Boolean(
    enterpriseFeatures?.searchDefaultSortNewestEnabled
    && recentlyReleasedIndexName
    && isExperimentVariant(config.EXPERIMENT_3_ID, config.EXPERIMENT_3_VARIANT_2_ID),
  );
  return newestSortEnabled ? recentlyReleasedIndexName : config.ALGOLIA_INDEX_NAME;
};

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
  const intl = useIntl();
  const indexName = useCourseSearchIndexName();
  return (
    <Index indexName={indexName} indexId={SEARCH_INDEX_IDS.COURSE}>
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
