import PropTypes from 'prop-types';
import { Configure, Index } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { useIntl } from '@edx/frontend-platform/i18n';
import { NUM_RESULTS_VIDEO, VIDEO_TITLE } from './constants';
import { SEARCH_INDEX_IDS } from '../../constants';
import SearchResults from './SearchResults';
import SearchVideoCard from './SearchVideoCard';

/**
 * Renders the video-specific Algolia search results section.
 *
 * @component
 * @param {{
 *   filter: string,
 *   showVideosBanner: () => void,
 *   hideVideosBanner: () => void
 * }} props
 *
 * @param {string} props.filter - A fully constructed Algolia filter string that includes
 * the `content_type:video` clause. Filters the search results to video content.
 *
 * @param {Function} props.showVideosBanner - Callback executed when search results are found.
 * Typically used to display a banner or announcement related to video results.
 *
 * @param {Function} props.hideVideosBanner - Callback executed when no search results are found.
 * Used to hide the banner or related UI elements when there are no matching video results.
 *
 * @example
 * <SearchVideo
 *   filter="content_type:video AND duration:<5"
 *   showVideosBanner={() => setBannerVisible(true)}
 *   hideVideosBanner={() => setBannerVisible(false)}
 * />
 */
const SearchVideo = ({
  filter, showVideosBanner, hideVideosBanner,
}) => {
  const config = getConfig();
  const intl = useIntl();

  return (
    <Index indexName={config.ALGOLIA_REPLICA_INDEX_NAME} indexId={SEARCH_INDEX_IDS.VIDEOS}>
      <Configure
        hitsPerPage={NUM_RESULTS_VIDEO}
        filters={filter}
        clickAnalytics
      />
      <SearchResults
        hitComponent={SearchVideoCard}
        title={VIDEO_TITLE}
        translatedTitle={
          intl.formatMessage({
            id: 'enterprise.search.page.video.section.translated.title',
            defaultMessage: 'Videos',
            description: 'Translated title for the enterprise search page videos section.',
          })
        }
        componentId={SEARCH_INDEX_IDS.VIDEOS}
        handlers={{
          searchResults: showVideosBanner,
          noSearchResults: hideVideosBanner,
        }}
        showBetaBadge
      />
    </Index>
  );
};

SearchVideo.propTypes = {
  filter: PropTypes.string.isRequired,
  showVideosBanner: PropTypes.func.isRequired,
  hideVideosBanner: PropTypes.func.isRequired,
};

export default SearchVideo;
