import React from 'react';
import PropTypes from 'prop-types';
import { Configure, Index } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';

import { NUM_RESULTS_PATHWAY, CONTENT_TYPE_PATHWAY, PATHWAY_TITLE } from './constants';
import SearchResults from './SearchResults';
import SearchPathwayCard from '../pathway/SearchPathwayCard';

function SearchPathway({ filter }) {
  const defaultFilter = `content_type:${CONTENT_TYPE_PATHWAY}  AND ${filter}`;
  const config = getConfig();

  return (
    <Index indexName={config.ALGOLIA_INDEX_NAME} indexId="search-pathways">
      <Configure
        hitsPerPage={NUM_RESULTS_PATHWAY}
        filters={defaultFilter}
        clickAnalytics
      />
      <SearchResults hitComponent={SearchPathwayCard} title={PATHWAY_TITLE} />
    </Index>
  );
}

SearchPathway.propTypes = {
  filter: PropTypes.string.isRequired,
};

export default SearchPathway;
