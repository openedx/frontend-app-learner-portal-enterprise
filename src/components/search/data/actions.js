export const DELETE_KEY = 'deleteKey';
export const DELETE_MULTIPLE_KEYS = 'deleteMultipleKeys';
export const SET_KEY = 'setKey';
export const CLEAR_FILTERS = 'clear';
export const SET_MULTIPLE_KEYS = 'setKeys';
export const SET_ARRAY_VALUE = 'setArrayValue';
export const REMOVE_ARRAY_VALUE = 'REMOVE_ARRAY_VALUE';
export const UPDATE_ARRAY_VALUE = 'UPDATE_ARRAY_VALUE';

export const deleteKeyAction = (key) => ({
  type: DELETE_KEY,
  key,
});

export const deleteMultipleKeysAction = (keys) => ({
  type: DELETE_MULTIPLE_KEYS,
  keys,
});

export const setKeyAction = (key, value) => ({
  type: SET_KEY,
  key,
  value,
});

export const setMultipleKeysAction = (newKeyValues = {}) => ({
  type: SET_MULTIPLE_KEYS,
  payload: newKeyValues,
});

export const clearFiltersAction = () => ({ type: CLEAR_FILTERS });

export const setArrayValue = (key, value) => ({
  type: SET_ARRAY_VALUE,
  key,
  value,
});

export const removeArrayValue = (key, value) => ({
  type: REMOVE_ARRAY_VALUE,
  key,
  value,
});

export const updateArrayValue = (key, value) => ({
  type: UPDATE_ARRAY_VALUE,
  key,
  value,
});
