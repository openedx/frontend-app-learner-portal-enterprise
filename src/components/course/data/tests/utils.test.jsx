import { findOfferForCourse } from '../utils';

describe('findOfferForCourse', () => {
  const offers = [{ code: 'bearsRus', catalog: 'bears' }];

  test('returns valid offer index if offer catalog is in catalog list', () => {
    const catalogList = ['cats', 'bears'];
    expect(findOfferForCourse(offers, catalogList)).toEqual(offers[0]);
  });

  test('returns null if catalog list is empty', () => {
    expect(findOfferForCourse(offers)).toBeNull();
  });
});
