import React from 'react';
import PropTypes from 'prop-types';
import { Configure, Index } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';

import { NUM_RESULTS_PROGRAM, CONTENT_TYPE_PROGRAM, PROGRAM_TITLE } from './constants';
import SearchResults from './SearchResults';
import SearchProgramCard from './SearchProgramCard';

const SearchProgram = ({ filter }) => {
  const defaultFilter = `content_type:${CONTENT_TYPE_PROGRAM} AND ${filter}`;
  const config = getConfig();

  return (
    <Index indexName={config.ALGOLIA_INDEX_NAME} indexId="search-programs">
      <Configure
        hitsPerPage={NUM_RESULTS_PROGRAM}
        filters={defaultFilter}
        clickAnalytics
      />
      <SearchResults hitComponent={SearchProgramCard} title={PROGRAM_TITLE} />
    </Index>
  );
};

SearchProgram.propTypes = {
  filter: PropTypes.string.isRequired,
};

export default SearchProgram;
