import offersReducer from '../reducer';
import {
  FETCH_OFFERS_REQUEST,
  FETCH_OFFERS_SUCCESS,
  FETCH_OFFERS_FAILURE,
} from '../constants';

const initialState = {
  loading: false,
  offers: [],
  offersCount: 0,
  error: null,
};

describe('offers reducer', () => {
  it('should return the initial state', () => {
    expect(offersReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle FETCH_OFFERS_REQUEST', () => {
    const expected = {
      ...initialState,
      loading: true,
      error: null,
    };
    expect(offersReducer(undefined, {
      type: FETCH_OFFERS_REQUEST,
    })).toEqual(expected);
  });

  it('should handle FETCH_OFFERS_SUCCESS', () => {
    const expected = {
      loading: false,
      offers: ['some data'],
      offersCount: 4,
      error: null,
    };
    expect(offersReducer(undefined, {
      type: FETCH_OFFERS_SUCCESS,
      payload: {
        offers: ['some data'],
        offersCount: 4,
      },
    })).toEqual(expected);
  });

  it('should handle FETCH_OFFERS_FAILURE', () => {
    const expected = {
      ...initialState,
      loading: false,
      error: Error,
    };
    expect(offersReducer(undefined, {
      type: FETCH_OFFERS_FAILURE,
      payload: {
        error: Error,
      },
    })).toEqual(expected);
  });
});
