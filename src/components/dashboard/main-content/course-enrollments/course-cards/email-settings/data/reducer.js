import {
  UPDATE_EMAIL_SETTINGS_REQUEST,
  UPDATE_EMAIL_SETTINGS_SUCCESS,
  UPDATE_EMAIL_SETTINGS_FAILURE,
} from './constants';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const emailSettings = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_EMAIL_SETTINGS_REQUEST:
      return {
        loading: true,
        error: null,
      };
    case UPDATE_EMAIL_SETTINGS_SUCCESS:
      return {
        loading: false,
        error: null,
        data: action.payload.data,
      };
    case UPDATE_EMAIL_SETTINGS_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default emailSettings;
