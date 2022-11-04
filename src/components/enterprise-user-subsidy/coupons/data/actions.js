import { camelCaseObject } from '@edx/frontend-platform';

import {
  FETCH_COUPON_CODES_REQUEST,
  FETCH_COUPON_CODES_SUCCESS,
  FETCH_COUPON_CODES_FAILURE,
} from './constants';

import findCouponCodeRedemptionCount from './utils';
import * as service from './service';

const fetchCouponCodesRequest = () => ({
  type: FETCH_COUPON_CODES_REQUEST,
});

const fetchCouponCodesSuccess = data => ({
  type: FETCH_COUPON_CODES_SUCCESS,
  payload: {
    couponCodes: data.results,
    couponCodesCount: findCouponCodeRedemptionCount(data.results),
  },
});

const fetchCouponCodesFailure = error => ({
  type: FETCH_COUPON_CODES_FAILURE,
  payload: {
    error,
  },
});

export const fetchCouponCodeAssignments = (queryOptions, dispatch) => {
  dispatch(fetchCouponCodesRequest());

  return service.fetchCouponCodeAssignments(queryOptions)
    .then((response) => {
      // dispatch(fetchCouponCodesSuccess(camelCaseObject(response.data)));
      dispatch(fetchCouponCodesSuccess(camelCaseObject({
        count: 0,
        results: [],
      })));
    })
    .catch((error) => {
      dispatch(fetchCouponCodesFailure(error));
    });
};
