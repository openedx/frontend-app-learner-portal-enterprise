import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import qs from 'query-string';
import { SearchField } from '@edx/paragon';
import { connectSearchBox } from 'react-instantsearch-dom';

import { QUERY_PARAM_FOR_SEARCH_QUERY } from './data/constants';

const INITIAL_QUERY_VALUE = '';

const SearchBox = ({
  className,
  defaultRefinement,
  refinementsFromQueryParams,
}) => {
  const history = useHistory();

  const query = defaultRefinement || INITIAL_QUERY_VALUE;

  /**
   * Handles when a search is submitted by adding the user's search
   * query as a query parameter. Note that it must preserved any other
   * existing query parameters must be preserved.
   */
  const handleSubmit = (searchQuery) => {
    const refinements = { ...refinementsFromQueryParams };
    refinements.q = searchQuery;
    Object.entries(refinements).forEach(([key, value]) => {
      if (key !== QUERY_PARAM_FOR_SEARCH_QUERY) {
        refinements[key] = value.join(',');
      }
    });
    history.push({ search: qs.stringify(refinements) });
  };

  /**
   * Handles when a search is cleared by removing the user's search query
   * from the query parameters.
   */
  const handleClear = () => {
    const refinements = { ...refinementsFromQueryParams };
    delete refinements.q;
    history.push({ search: qs.stringify(refinements) });
  };

  return (
    <div className={className}>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label id="search-input-box" className="mb-2 text-brand-primary font-weight-normal">
        Search Courses
      </label>
      <SearchField.Advanced
        className="border-0 bg-white"
        value={query}
        onSubmit={handleSubmit}
        onClear={handleClear}
      >
        <SearchField.Input className="form-control-lg" aria-labelledby="search-input-box" />
        <SearchField.ClearButton />
        <SearchField.SubmitButton />
      </SearchField.Advanced>
    </div>
  );
};

SearchBox.propTypes = {
  refinementsFromQueryParams: PropTypes.shape().isRequired,
  defaultRefinement: PropTypes.string,
  className: PropTypes.string,
};

SearchBox.defaultProps = {
  className: undefined,
  defaultRefinement: undefined,
};

export default connectSearchBox(SearchBox);
