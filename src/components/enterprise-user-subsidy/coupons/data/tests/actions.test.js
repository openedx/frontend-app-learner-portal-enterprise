import {
  FETCH_COUPON_CODES_REQUEST,
  FETCH_COUPON_CODES_SUCCESS,
  FETCH_COUPON_CODES_FAILURE,
} from '../constants';
import {
  fetchCouponCodeAssignments,
} from '../actions';
import * as service from '../service';

jest.mock('../service');

describe('fetchCouponCodeAssignments action', () => {
  it('fetch coupon codes success', () => {
    const expectedAction = [
      { type: FETCH_COUPON_CODES_REQUEST },
      {
        type: FETCH_COUPON_CODES_SUCCESS,
        payload: {
          couponCodes: [{ fooBar: 'foo', redemptionsRemaining: 2 }],
          couponCodesCount: 2,
        },
      },
    ];

    service.fetchCouponCodeAssignments.mockImplementation((
      () => Promise.resolve({ data: { results: [{ foo_bar: 'foo', redemptions_remaining: 2 }], count: 2 } })
    ));
    const dispatchSpy = jest.fn();
    return fetchCouponCodeAssignments(null, dispatchSpy)
      .then(() => {
        expect(dispatchSpy).toHaveBeenNthCalledWith(1, expectedAction[0]);
        expect(dispatchSpy).toHaveBeenNthCalledWith(2, expectedAction[1]);
      });
  });

  it('fetch coupon codes failure', () => {
    const expectedAction = [
      { type: FETCH_COUPON_CODES_REQUEST },
      {
        type: FETCH_COUPON_CODES_FAILURE,
        payload: {
          error: Error,
        },
      },
    ];

    service.fetchCouponCodeAssignments.mockImplementation((
      () => Promise.reject(Error)
    ));
    const dispatchSpy = jest.fn();
    return fetchCouponCodeAssignments(null, dispatchSpy)
      .then(() => {
        expect(dispatchSpy).toHaveBeenNthCalledWith(1, expectedAction[0]);
        expect(dispatchSpy).toHaveBeenNthCalledWith(2, expectedAction[1]);
      });
  });
});
