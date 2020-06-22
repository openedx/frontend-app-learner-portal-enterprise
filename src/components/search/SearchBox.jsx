import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SearchField } from '@edx/paragon';
import { connectSearchBox } from 'react-instantsearch-dom';

const INITIAL_QUERY_VALUE = '';

const SearchBox = ({
  className,
  refine,
  defaultRefinement,
}) => {
  const [query, setQuery] = useState(defaultRefinement || INITIAL_QUERY_VALUE);

  useEffect(
    () => {
      refine(query);
    },
    [query],
  );

  return (
    <div className={className}>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label id="search-input-box" className="mb-2 text-brand-primary font-weight-normal">
        Search Courses
      </label>
      <SearchField.Advanced
        className="border-0 bg-white"
        value={query}
        onSubmit={setQuery}
        onClear={() => setQuery(INITIAL_QUERY_VALUE)}
      >
        <SearchField.Input className="form-control-lg" aria-labelledby="search-input-box" />
        <SearchField.ClearButton />
        <SearchField.SubmitButton />
      </SearchField.Advanced>
    </div>
  );
};

SearchBox.propTypes = {
  refine: PropTypes.func.isRequired,
  defaultRefinement: PropTypes.string,
  className: PropTypes.string,
};

SearchBox.defaultProps = {
  className: undefined,
  defaultRefinement: undefined,
};

export default connectSearchBox(SearchBox);
