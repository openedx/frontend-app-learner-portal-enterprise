import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { useHistory } from 'react-router-dom';
import { connectPagination } from 'react-instantsearch-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { Pagination } from '@edx/paragon';

import { updateRefinementsFromQueryParams } from './data/utils';
import { useRefinementsFromQueryParams } from './data/hooks';

export const SearchPaginationBase = ({
  nbPages,
  currentRefinement,
  maxPagesDisplayed,
}) => {
  const history = useHistory();
  const refinementsFromQueryParams = useRefinementsFromQueryParams();

  const icons = useMemo(
    () => ({
      left: (
        <>
          <FontAwesomeIcon icon={faAngleLeft} />
          <div className="sr-only">Navigate Left</div>
        </>
      ),
      right: (
        <>
          <FontAwesomeIcon icon={faAngleRight} />
          <div className="sr-only">Navigate Right</div>
        </>
      ),
    }),
    [],
  );

  const buttonLabels = {
    previous: '',
    next: '',
    page: 'Page',
    currentPage: 'Current Page',
    pageOfCount: 'of',
  };

  const handlePageSelect = (page) => {
    const refinements = { ...refinementsFromQueryParams };

    if (page > 1) {
      refinements.page = page;
    } else {
      delete refinements.page;
    }

    const updatedRefinements = updateRefinementsFromQueryParams(refinements);
    history.push({ search: qs.stringify(updatedRefinements) });
  };

  return (
    <Pagination
      paginationLabel="search results navigation"
      pageCount={nbPages}
      currentPage={currentRefinement}
      onPageSelect={handlePageSelect}
      maxPagesDisplayed={maxPagesDisplayed}
      buttonLabels={buttonLabels}
      icons={{
        leftIcon: icons.left,
        rightIcon: icons.right,
      }}
    />
  );
};

SearchPaginationBase.propTypes = {
  nbPages: PropTypes.number.isRequired,
  currentRefinement: PropTypes.number,
  maxPagesDisplayed: PropTypes.number,
};

SearchPaginationBase.defaultProps = {
  currentRefinement: 1,
  maxPagesDisplayed: 7,
};

export default connectPagination(SearchPaginationBase);
