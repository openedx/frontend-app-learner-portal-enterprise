import moment from 'moment';
import { findOfferForCourse } from '../utils';

describe('findOfferForCourse', () => {
  const offers = [{
    code: 'bearsRus',
    catalog: 'bears',
    couponStartDate: moment().subtract(1, 'w').toISOString(),
    couponEndDate: moment().add(8, 'w').toISOString(),
  }];

  test('returns valid offer index if offer catalog is in catalog list', () => {
    const catalogList = ['cats', 'bears'];
    expect(findOfferForCourse(offers, catalogList)).toEqual(offers[0]);
  });

  test('returns undefined if catalog list is empty', () => {
    expect(findOfferForCourse(offers)).toBeUndefined();
  });
});
