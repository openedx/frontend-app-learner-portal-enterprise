import {
  FETCH_COUPON_CODES_REQUEST,
  FETCH_COUPON_CODES_SUCCESS,
  FETCH_COUPON_CODES_FAILURE,
} from './constants';

export const initialCouponCodesState = {
  loading: false,
  couponCodes: [],
  couponCodesCount: 0,
  error: null,
};

const couponCodesReducer = (state = initialCouponCodesState, action) => {
  switch (action.type) {
    case FETCH_COUPON_CODES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_COUPON_CODES_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        couponCodes: action.payload.couponCodes,
        couponCodesCount: action.payload.couponCodesCount,
      };
    case FETCH_COUPON_CODES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default couponCodesReducer;
