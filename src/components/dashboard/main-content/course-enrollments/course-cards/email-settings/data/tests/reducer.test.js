import emailSettings from '../reducer';
import {
  UPDATE_EMAIL_SETTINGS_REQUEST,
  UPDATE_EMAIL_SETTINGS_SUCCESS,
  UPDATE_EMAIL_SETTINGS_FAILURE,
} from '../constants';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

describe('emailSettings reducer', () => {
  it('has initial state', () => {
    expect(emailSettings(undefined, {})).toEqual(initialState);
  });

  it('updates state on request send', () => {
    const expected = {
      error: null,
      loading: true,
    };

    expect(emailSettings(undefined, {
      type: UPDATE_EMAIL_SETTINGS_REQUEST,
    })).toEqual(expected);
  });

  it('updates state on request success', () => {
    const expected = {
      error: null,
      loading: false,
      data: 'Some data',
    };

    expect(emailSettings(undefined, {
      type: UPDATE_EMAIL_SETTINGS_SUCCESS,
      payload: { data: 'Some data' },
    })).toEqual(expected);
  });

  it('updates state on request failure', () => {
    const expected = {
      error: 'Test course does not exist!',
      loading: false,
    };

    expect(emailSettings(undefined, {
      type: UPDATE_EMAIL_SETTINGS_FAILURE,
      payload: { error: 'Test course does not exist!' },
    })).toEqual(expected);
  });
});
