import React from 'react';
import PropTypes from 'prop-types';
import { Index, Configure } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/';
import { useDefaultSearchFilters } from '../data/hooks';
import PopularResults from './PopularResults';
import { NUM_RESULTS_TO_DISPLAY } from './data/constants';
import { getContentTypeFromTitle } from '../../utils/search';

const PopularResultsIndex = ({ title, numberResultsToDisplay }) => {
  const { filters } = useDefaultSearchFilters();
  const config = getConfig();
  const contentType = getContentTypeFromTitle(title);
  const defaultFilter = `content_type:${contentType} AND ${filters}`;
  const searchConfig = {
    query: '',
    hitsPerPage: numberResultsToDisplay,
    filters: defaultFilter,
  };
  return (
    <Index indexName={config.ALGOLIA_INDEX_NAME} indexId={`popular-${title}`}>
      <Configure {...searchConfig} />
      <PopularResults title={title} numberResultsToDisplay={numberResultsToDisplay} />
    </Index>
  );
};

PopularResultsIndex.propTypes = {
  title: PropTypes.string.isRequired,
  numberResultsToDisplay: PropTypes.number,
};

PopularResultsIndex.defaultProps = {
  numberResultsToDisplay: NUM_RESULTS_TO_DISPLAY,
};

export default PopularResultsIndex;
