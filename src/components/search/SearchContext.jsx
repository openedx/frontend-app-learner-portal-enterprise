import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const SearchContext = createContext();

const SearchData = ({ children }) => {
  // NOTE: If this context starts to store a lot of state, switch to useReducer
  const [showAllCatalogs, setShowAllCatalogs] = useState(false);
  const value = { showAllCatalogs, setShowAllCatalogs };
  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

SearchData.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SearchData;
