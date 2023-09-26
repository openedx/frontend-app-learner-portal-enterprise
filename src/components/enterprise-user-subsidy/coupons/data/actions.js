import { camelCaseObject } from '@edx/frontend-platform';

import {
  FETCH_COUPON_CODES_REQUEST,
  FETCH_COUPON_CODES_SUCCESS,
  FETCH_COUPON_CODES_FAILURE,
} from './constants';

import findCouponCodeRedemptionCount from './utils';
import * as service from './service';
import { hasValidStartExpirationDates } from '../../../../utils/common';

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
      const formattedResponse = camelCaseObject(response.data);
      const transformedResults = formattedResponse.results.map((couponCode) => ({
        ...couponCode,
        available: hasValidStartExpirationDates({
          startDate: couponCode.couponStartDate,
          endDate: couponCode.couponEndDate,
        }),
      }));
      dispatch(fetchCouponCodesSuccess(camelCaseObject({
        ...formattedResponse,
        results: transformedResults,
      })));
    })
    .catch((error) => {
      dispatch(fetchCouponCodesFailure(error));
    });
};
