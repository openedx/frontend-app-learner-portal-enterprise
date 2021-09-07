import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import {
  SET_KEY_VALUE,
} from './data/constants';
import { GOAL_DROPDOWN_DEFAULT_OPTION } from './constants';

export const SkillsContext = createContext();

const reducer = (state, action) => {
  const nextState = { ...state };
  switch (action.type) {
    case SET_KEY_VALUE:
      delete nextState.page;
      nextState[action.key] = action.value;
      return nextState;
  default:
    return state;
  }
};

export function SkillsContextProvider({ children, initialState = { goal: GOAL_DROPDOWN_DEFAULT_OPTION } }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };

  return (
    <SkillsContext.Provider value={value}>
      {children}
    </SkillsContext.Provider>
  );
}

SkillsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  // eslint-disable-next-line react/require-default-props
  initialState: PropTypes.shape({
  }),
};
