import React, { createContext } from 'react';
import PropTypes from 'prop-types';

export const ProgramContext = createContext();

export function ProgramContextProvider({ children, initialState }) {
  return (
    <ProgramContext.Provider value={initialState}>
      {children}
    </ProgramContext.Provider>
  );
}

ProgramContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialState: PropTypes.shape({
    programData: PropTypes.shape({}).isRequired,
  }).isRequired,
};
