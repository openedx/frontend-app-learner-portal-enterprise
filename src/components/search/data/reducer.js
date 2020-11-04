/* eslint-disable import/prefer-default-export */
import {
  DELETE_REFINEMENT, SET_REFINEMENT, CLEAR_REFINEMENTS, SET_REFINEMENTS_FROM_QUERY_PARAMS, ADD_TO_REFINEMENT_ARRAY,
  REMOVE_FROM_REFINEMENT_ARRAY,
} from './actions';
import { QUERY_PARAMS_TO_IGNORE } from './constants';

export const valueArrayReducer = (state = [], action) => {
  switch (action.type) {
    case REMOVE_FROM_REFINEMENT_ARRAY:
      return state.filter((value) => value !== action.value);
    case ADD_TO_REFINEMENT_ARRAY:
      return [...state, action.value];
    default:
      return [...state];
  }
};

export const refinementsReducer = (state = {}, action) => {
  // console.info('Refinement Action Triggered \n', action);
  const nextState = { ...state };
  switch (action.type) {
    case DELETE_REFINEMENT:
      delete nextState.page;
      delete nextState[action.key];
      return nextState;
    case SET_REFINEMENT:
      delete nextState.page;
      nextState[action.key] = action.value;
      return nextState;
    case SET_REFINEMENTS_FROM_QUERY_PARAMS:
      // we don't delete the page when setting multiple refinements. This action should only be used by SearchData,
      //  and it has to handle the page coming in as a query param. Deleting it can cause an infinite loop.
      Object.keys(state).forEach((key) => {
        // remove refinements that are not from query params
        if (!QUERY_PARAMS_TO_IGNORE.includes(key)) {
          delete nextState[key];
        }
      });
      return {
        ...nextState,
        ...action.payload,
      };
    case ADD_TO_REFINEMENT_ARRAY:
      delete nextState.page;
      return {
        ...nextState,
        [action.key]: valueArrayReducer(state[action.key], action),
      };
    case REMOVE_FROM_REFINEMENT_ARRAY:
      if (nextState[action.key]) {
        delete nextState.page;
        return {
          ...nextState,
          [action.key]: valueArrayReducer(state[action.key], action),
        };
      }
      return nextState;
    case CLEAR_REFINEMENTS:
      delete nextState.page;
      Object.keys(nextState).forEach((key) => {
        if (!QUERY_PARAMS_TO_IGNORE.includes(key)) {
          delete nextState[key];
        }
      });
      return nextState;
    default:
      return nextState;
  }
};
