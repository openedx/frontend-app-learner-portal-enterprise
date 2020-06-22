import React from 'react';

import SearchBox from './SearchBox';
import SearchFilters from './SearchFilters';
import CurrentRefinements from './CurrentRefinements';

const SearchHeader = () => (
  <div className="bg-brand-primary">
    <div className="container-fluid">
      <div className="row pt-4 pb-3">
        <div className="col-12 col-md-10 col-lg-8">
          <SearchBox className="mb-3" />
        </div>
        <div className="col-12">
          <SearchFilters className="mb-3" />
          <CurrentRefinements />
        </div>
      </div>
    </div>
  </div>
);

export default SearchHeader;
