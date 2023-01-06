import React, { createContext } from 'react';
import PropTypes from 'prop-types';

export const PathwayProgressContext = createContext();

export const PathwayProgressContextProvider = ({ children, initialState }) => (
  <PathwayProgressContext.Provider value={initialState}>
    {children}
  </PathwayProgressContext.Provider>
);

PathwayProgressContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialState: PropTypes.shape({
    learnerPathwayProgress: PropTypes.shape({}).isRequired,
  }).isRequired,
};
