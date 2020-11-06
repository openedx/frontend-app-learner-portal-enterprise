export const DELETE_REFINEMENT = 'DELETE_REFINEMENT';
export const SET_REFINEMENT = 'SET_REFINEMENT';
export const CLEAR_REFINEMENTS = 'CLEAR_REFINEMENTS';
export const SET_REFINEMENTS_FROM_QUERY_PARAMS = 'SET_REFINEMENTS_FROM_QUERY_PARAMS';
export const ADD_TO_REFINEMENT_ARRAY = 'ADD_TO_REFINEMENT_ARRAY';
export const REMOVE_FROM_REFINEMENT_ARRAY = 'REMOVE_FROM_REFINEMENT_ARRAY';

export const deleteRefinementAction = (key) => ({
  type: DELETE_REFINEMENT,
  key,
});

export const setRefinementAction = (key, value) => ({
  type: SET_REFINEMENT,
  key,
  value,
});

export const setMultipleRefinementsAction = (newKeyValues = {}) => ({
  type: SET_REFINEMENTS_FROM_QUERY_PARAMS,
  payload: newKeyValues,
});

export const clearRefinementsAction = () => ({ type: CLEAR_REFINEMENTS });

export const addToRefinementArray = (key, value) => ({
  type: ADD_TO_REFINEMENT_ARRAY,
  key,
  value,
});

export const removeFromRefinementArray = (key, value) => ({
  type: REMOVE_FROM_REFINEMENT_ARRAY,
  key,
  value,
});
