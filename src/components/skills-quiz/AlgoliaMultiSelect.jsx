import React from 'react';
import PropTypes from 'prop-types';

import { InstantSearch, Index } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import algoliasearch from 'algoliasearch/lite';
import Tags from './Tags';

export const TagSelectedComponent = ({ hit }) => (
  <>
    <code>{hit.name}</code>
  </>
);
TagSelectedComponent.propTypes = {
  hit: PropTypes.shape({
    name: PropTypes.string,
    external_id: PropTypes.string,
    objectID: PropTypes.string,
    skill: PropTypes.array,
    job_postings: PropTypes.array,
  }).isRequired,
};

export const TagSuggestionComponent = ({ hit }) => (
  <>
    {hit.name} <small><code>{hit.external_id}</code></small><br />
  </>
);

TagSuggestionComponent.propTypes = {
  hit: PropTypes.shape({
    name: PropTypes.string,
    external_id: PropTypes.string,
    objectID: PropTypes.string,
    skill: PropTypes.array,
    job_postings: PropTypes.array,
  }).isRequired,
};

export const NoResultComponent = ({ query }) => (
  <>
    <strong>&quot;{query}&quot;</strong> job does not exist. Create it?
  </>
);

NoResultComponent.propTypes = {
  query: PropTypes.string.isRequired,
};

const AlgoliaMultiSelect = () => {
  const config = getConfig();
  const searchClient = algoliasearch(
    config.ALGOLIA_APP_ID,
    config.ALGOLIA_SEARCH_API_KEY,
  );
  const onAddTag = hit => hit;

  const onTagsUpdated = (actualTags) => {
    console.log('Tags updated', actualTags);
  };

  return (
    <>
      <InstantSearch
        indexName={config.ALGOLIA_INDEX_NAME}
        searchClient={searchClient}
      >
        <Index indexName={config.ALGOLIA_INDEX_NAME}>
          <Tags
            selectedTagComponent={TagSelectedComponent}
            suggestedTagComponent={TagSuggestionComponent}
            noResultComponent={NoResultComponent}
            onAddTag={onAddTag}
            onUpdate={onTagsUpdated}
            translations={{ placeholder: 'Select a job...', noResult: 'No jobs found.' }}
            limitTo={10}
          />
        </Index>
      </InstantSearch>
    </>
  );
};

AlgoliaMultiSelect.propTypes = { };

export default AlgoliaMultiSelect;
