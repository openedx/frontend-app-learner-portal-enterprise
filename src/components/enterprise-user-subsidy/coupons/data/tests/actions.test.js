import {
  FETCH_COUPON_CODES_REQUEST,
  FETCH_COUPON_CODES_SUCCESS,
  FETCH_COUPON_CODES_FAILURE,
} from '../constants';
import {
  fetchCouponCodeAssignments,
} from '../actions';
import * as service from '../service';
import { hasValidStartExpirationDates } from '../../../../../utils/common';

jest.mock('../service');
jest.mock('../../../../../utils/common', () => ({
  ...jest.requireActual('../../../../../utils/common'),
  hasValidStartExpirationDates: jest.fn(),
}));

describe('fetchCouponCodeAssignments action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    { couponStartDate: '2020-10-20', couponEndDate: '2021-10-20', expectedAvailability: true },
    { couponStartDate: '2022-06-12', couponEndDate: '2023-06-12', expectedAvailability: false },
  ])('fetch coupon codes success (%s)', ({
    couponStartDate,
    couponEndDate,
    expectedAvailability,
  }) => {
    hasValidStartExpirationDates.mockReturnValue(expectedAvailability);
    const expectedAction = [
      { type: FETCH_COUPON_CODES_REQUEST },
      {
        type: FETCH_COUPON_CODES_SUCCESS,
        payload: {
          couponCodes: [{
            fooBar: 'foo',
            redemptionsRemaining: 2,
            available: expectedAvailability,
            couponStartDate,
            couponEndDate,
          }],
          couponCodesCount: 2,
        },
      },
    ];

    service.fetchCouponCodeAssignments.mockImplementation((
      () => Promise.resolve({
        data: {
          results: [{
            foo_bar: 'foo',
            redemptions_remaining: 2,
            coupon_start_date: couponStartDate,
            coupon_end_date: couponEndDate,
          }],
          count: 2,
        },
      })
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
