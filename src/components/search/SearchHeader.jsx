import React from 'react';
import PropTypes from 'prop-types';

import SearchBox from './SearchBox';
import SearchFilters from './SearchFilters';

import { useRefinementsFromQueryParams } from './data/hooks';

const SearchHeader = ({ showAllCatalogs, setShowAllCatalogs }) => {
  const refinementsFromQueryParams = useRefinementsFromQueryParams();

  const searchQueryFromQueryParams = refinementsFromQueryParams.q;

  return (
    <div className="bg-brand-primary">
      <div className="container-fluid">
        <div className="row pt-4 pb-3">
          <div className="col-12 col-md-10 col-lg-8">
            <SearchBox
              className="mb-3"
              defaultRefinement={searchQueryFromQueryParams}
              refinementsFromQueryParams={refinementsFromQueryParams}
            />
          </div>
          <div className="col-12">
            <SearchFilters
              className="mb-3"
              showAllCatalogs={showAllCatalogs}
              setShowAllCatalogs={setShowAllCatalogs}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

SearchHeader.propTypes = {
  showAllCatalogs: PropTypes.bool.isRequired,
  setShowAllCatalogs: PropTypes.func.isRequired,
};

export default SearchHeader;
