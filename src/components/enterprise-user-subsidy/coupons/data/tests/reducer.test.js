import couponCodesReducer from '../reducer';
import {
  FETCH_COUPON_CODES_REQUEST,
  FETCH_COUPON_CODES_SUCCESS,
  FETCH_COUPON_CODES_FAILURE,
} from '../constants';

const initialState = {
  loading: false,
  couponCodes: [],
  couponCodesCount: 0,
  error: null,
};

describe('couponCodesReducer', () => {
  it('should return the initial state', () => {
    expect(couponCodesReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle FETCH_COUPON_CODES_REQUEST', () => {
    const expected = {
      ...initialState,
      loading: true,
      error: null,
    };
    expect(couponCodesReducer(undefined, {
      type: FETCH_COUPON_CODES_REQUEST,
    })).toEqual(expected);
  });

  it('should handle FETCH_COUPON_CODES_SUCCESS', () => {
    const expected = {
      loading: false,
      couponCodes: ['some data'],
      couponCodesCount: 4,
      error: null,
    };
    expect(couponCodesReducer(undefined, {
      type: FETCH_COUPON_CODES_SUCCESS,
      payload: {
        couponCodes: ['some data'],
        couponCodesCount: 4,
      },
    })).toEqual(expected);
  });

  it('should handle FETCH_COUPON_CODES_FAILURE', () => {
    const expected = {
      ...initialState,
      loading: false,
      error: Error,
    };
    expect(couponCodesReducer(undefined, {
      type: FETCH_COUPON_CODES_FAILURE,
      payload: {
        error: Error,
      },
    })).toEqual(expected);
  });
});
