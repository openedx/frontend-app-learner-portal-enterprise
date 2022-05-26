import moment from 'moment';
import { findCouponCodeForCourse } from '../utils';

describe('findCouponCodeForCourse', () => {
  const couponCodes = [{
    code: 'bearsRus',
    catalog: 'bears',
    couponStartDate: moment().subtract(1, 'w').toISOString(),
    couponEndDate: moment().add(8, 'w').toISOString(),
  }];

  test('returns valid index if coupon code catalog is in catalog list', () => {
    const catalogList = ['cats', 'bears'];
    expect(findCouponCodeForCourse(couponCodes, catalogList)).toEqual(couponCodes[0]);
  });

  test('returns undefined if catalog list is empty', () => {
    expect(findCouponCodeForCourse(couponCodes)).toBeUndefined();
  });
});
