import React, { createContext } from 'react';
import PropTypes from 'prop-types';

export const ProgramProgressContext = createContext();

export function ProgramProgressContextProvider({ children, initialState }) {
  return (
    <ProgramProgressContext.Provider value={initialState}>
      {children}
    </ProgramProgressContext.Provider>
  );
}

ProgramProgressContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialState: PropTypes.shape({
    programData: PropTypes.shape({}).isRequired,
  }).isRequired,
};
