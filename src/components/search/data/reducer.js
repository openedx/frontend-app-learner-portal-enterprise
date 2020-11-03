/* eslint-disable import/prefer-default-export */
import {
  DELETE_KEY, SET_KEY, CLEAR_FILTERS, SET_MULTIPLE_KEYS, SET_ARRAY_VALUE, REMOVE_ARRAY_VALUE,
} from './actions';
import { QUERY_PARAMS_TO_IGNORE, FREE_ALL_ATTRIBUTE } from './constants';

export const valueArrayReducer = (state = [], action) => {
  switch (action.type) {
    case REMOVE_ARRAY_VALUE:
      return state.filter((value) => value !== action.value);
    case SET_ARRAY_VALUE:
      return [...state, action.value];
    default:
      return [...state];
  }
};

export const defaultState = {
  [FREE_ALL_ATTRIBUTE]: 0,
};

export const refinementsReducer = (state = {}, action) => {
  console.info('Action Triggered \n', action);
  const nextState = { ...state };
  switch (action.type) {
    case DELETE_KEY:
      delete nextState.page;
      delete nextState[action.key];
      return nextState;
    case SET_KEY:
      delete nextState.page;
      nextState[action.key] = action.value;
      return nextState;
    case SET_MULTIPLE_KEYS:
      delete nextState.page;
      return {
        ...nextState,
        ...action.payload,
      };
    case SET_ARRAY_VALUE:
      delete nextState.page;
      return {
        ...nextState,
        [action.key]: valueArrayReducer(state[action.key], action),
      };
    case REMOVE_ARRAY_VALUE:
      if (nextState[action.key]) {
        delete nextState.page;
        return {
          ...nextState,
          [action.key]: valueArrayReducer(state[action.key], action),
        };
      }
      return nextState;
    case CLEAR_FILTERS:
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
