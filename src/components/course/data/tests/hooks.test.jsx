import { renderHook } from '@testing-library/react-hooks';

import { useCourseEnrollmentUrl } from '../hooks';
import { LICENSE_SUBSIDY_TYPE } from '../constants';

jest.mock('../../../../config', () => ({
  features: { ENROLL_WITH_CODES: true },
}));

describe('useCourseEnrollmentUrl', () => {
  const noSubscriptionEnrollmentInputs = {
    enterpriseConfig: {
      uuid: 'foo',
    },
    key: 'bar',
    offers: [{ code: 'bearsRus', catalog: 'bears' }],
    sku: 'xkcd',
    catalogList: ['bears'],
    location: { search: 'foo' },
  };
  // just skip the offers here to ensure we process absence correctly
  const noOffersEnrollmentInputs = {
    enterpriseConfig: {
      uuid: 'foo',
    },
    key: 'bar',
    sku: 'xkcd',
    catalogList: ['bears'],
    location: { search: 'foo' },
  };
  const enrollmentInputs = {
    ...noSubscriptionEnrollmentInputs,
    subscriptionLicense: {
      uuid: 'yes',
    },
    userSubsidyApplicableToCourse: {
      subsidyType: LICENSE_SUBSIDY_TYPE,
    },
  };

  describe('subscription license', () => {
    test('returns an lms url to DSC for enrollment with a license', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl(enrollmentInputs));
      expect(result.current).toContain(process.env.LMS_BASE_URL);
      expect(result.current).toContain(enrollmentInputs.enterpriseConfig.uuid);
      expect(result.current).toContain(enrollmentInputs.key);
      expect(result.current).toContain(enrollmentInputs.subscriptionLicense.uuid);
    });

    test('does not use the license uuid for enrollment if there is no valid license subsidy (even with a license uuid)', () => {
      const noSubsidyEnrollmentInputs = { ...enrollmentInputs };
      delete noSubsidyEnrollmentInputs.userSubsidyApplicableToCourse;

      const { result } = renderHook(() => useCourseEnrollmentUrl(noSubsidyEnrollmentInputs));
      expect(result.current).not.toContain(enrollmentInputs.subscriptionLicense.uuid);
    });
  });

  describe('offers (codes)', () => {
    test('with offer for course returns ecommerce url to redeem product with code', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl(noSubscriptionEnrollmentInputs));
      expect(result.current).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(result.current).toContain(noSubscriptionEnrollmentInputs.sku);
      expect(result.current).toContain(noSubscriptionEnrollmentInputs.offers[0].code);
      expect(result.current).toContain(enrollmentInputs.key);
    });

    test('with no offers for catalog returns ecommerce url to add product to basket', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noSubscriptionEnrollmentInputs,
        catalogList: ['foo'],
      }));
      expect(result.current).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(result.current).toContain(noSubscriptionEnrollmentInputs.sku);
      expect(result.current).toContain(enrollmentInputs.key);
      expect(result.current).not.toContain('code');
    });

    test('with no assigned offers returns ecommerce url to add product to basket', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noSubscriptionEnrollmentInputs,
        offers: [],
      }));
      expect(result.current).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(result.current).toContain(noSubscriptionEnrollmentInputs.sku);
      expect(result.current).toContain(enrollmentInputs.key);
      expect(result.current).not.toContain('code');
    });
    test('with no offers passed, treats it as empty offers and does not fail', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noOffersEnrollmentInputs,
      }));
      expect(result.current).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(result.current).toContain(noSubscriptionEnrollmentInputs.sku);
      expect(result.current).toContain(enrollmentInputs.key);
      expect(result.current).not.toContain('code');
    });

    test('with missing product sku returns null', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noSubscriptionEnrollmentInputs,
        sku: undefined,
      }));
      expect(result.current).toBeNull();
    });
  });
});
