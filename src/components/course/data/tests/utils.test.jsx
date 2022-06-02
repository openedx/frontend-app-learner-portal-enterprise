import moment from 'moment';
import { findCouponCodeForCourse, findEnterpriseOfferForCourse } from '../utils';

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

describe('findEnterpriseOfferForCourse', () => {
  const enterpriseOffers = [
    {
      enterpriseCatalogUuid: 'cats',
      remainingBalance: 99,
    },
    {
      enterpriseCatalogUuid: 'horses',
      remainingBalance: 100,
    },
    {
      enterpriseCatalogUuid: 'cats',
      remainingBalance: 100,
    },
  ];

  it('returns undefined if there is no course price', () => {
    const catalogList = ['cats', 'bears'];
    expect(findEnterpriseOfferForCourse({
      enterpriseOffers, catalogList,
    })).toBeUndefined();
  });

  it('returns undefined if there is no enterprise offer for the course', () => {
    const catalogList = ['pigs'];
    expect(findEnterpriseOfferForCourse({
      enterpriseOffers, catalogList,
    })).toBeUndefined();
  });

  it('returns the enterprise offer with a valid catalog that has remaining balance >= course price', () => {
    const catalogList = ['cats', 'bears'];
    expect(findEnterpriseOfferForCourse({
      enterpriseOffers, catalogList, coursePrice: 100,
    })).toBe(enterpriseOffers[2]);
  });
});
