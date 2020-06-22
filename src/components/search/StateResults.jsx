import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connectStateResults } from 'react-instantsearch-dom';

export const StateResultsContext = createContext();

const StateResults = ({
  searchState,
  children,
}) => {
  const value = useMemo(
    () => ({
      searchState,
    }),
    [searchState],
  );

  return (
    <StateResultsContext.Provider value={value}>
      {children}
    </StateResultsContext.Provider>
  );
};

StateResults.propTypes = {
  searchState: PropTypes.shape().isRequired,
  children: PropTypes.node.isRequired,
};

export default connectStateResults(StateResults);
