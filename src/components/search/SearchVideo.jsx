import React from 'react';
import PropTypes from 'prop-types';
import { Configure, Index } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { useIntl } from '@edx/frontend-platform/i18n';
import { VIDEO_TITLE, NUM_RESULTS_VIDEO, CONTENT_TYPE_VIDEO } from './constants';
import SearchResults from './SearchResults';
import SearchVideoCard from './SearchVideoCard';

const SearchVideo = ({ filter }) => {
  const defaultFilter = `content_type:${CONTENT_TYPE_VIDEO} AND ${filter}`;
  const config = getConfig();
  const intl = useIntl();

  return (
    <Index indexName={config.ALGOLIA_REPLICA_INDEX_NAME} indexId="search-videos">
      <Configure
        hitsPerPage={NUM_RESULTS_VIDEO}
        filters={defaultFilter}
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
        showBetaBadge
      />
    </Index>
  );
};

SearchVideo.propTypes = {
  filter: PropTypes.string.isRequired,
};

export default SearchVideo;
