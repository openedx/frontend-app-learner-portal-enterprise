import { renderHook } from '@testing-library/react-hooks';

import { useCourseEnrollmentUrl, useUserHasSubsidyRequestForCourse } from '../hooks';
import { SubsidyRequestsContext } from '../../../enterprise-subsidy-requests/SubsidyRequestsContextProvider';
import { SUBSIDY_TYPE, SUBSIDY_REQUEST_STATE } from '../../../enterprise-subsidy-requests/constants';
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

describe('useUserHasSubsidyRequestForCourse', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns false when `subsidyRequestConfiguration` are not set', () => {
    const context = {
      subsidyRequestConfiguration: null,
    };
    /* eslint-disable react/prop-types */
    const wrapper = ({ children }) => (
      <SubsidyRequestsContext.Provider value={context}>{children}</SubsidyRequestsContext.Provider>
    );
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse(), { wrapper });
    expect(result.current).toBe(false);
  });

  it('returns false when `subsidyType` is undefined', () => {
    const context = {
      subsidyRequestConfiguration: { subsidyType: undefined },
      requestsBySubsidyType: {
        [SUBSIDY_TYPE.LICENSE]: [],
        [SUBSIDY_TYPE.COUPON]: [],
      },
    };
    const wrapper = ({ children }) => (/* eslint-disable react/prop-types */
      <SubsidyRequestsContext.Provider value={context}>{children}</SubsidyRequestsContext.Provider>
    );
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse(), { wrapper });
    expect(result.current).toBe(false);
  });

  it('returns true when `subsidyType` is LICENSE && 1 license request is found', () => {
    const context = {
      subsidyRequestConfiguration: {
        subsidyRequestsEnabled: true,
        subsidyType: SUBSIDY_TYPE.LICENSE,
      },
      requestsBySubsidyType: {
        [SUBSIDY_TYPE.LICENSE]: [{ state: SUBSIDY_REQUEST_STATE.REQUESTED }],
        [SUBSIDY_TYPE.COUPON]: [],
      },
    };
    const wrapper = ({ children }) => (/* eslint-disable react/prop-types */
      <SubsidyRequestsContext.Provider value={context}>{children}</SubsidyRequestsContext.Provider>
    );
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse(), { wrapper });
    expect(result.current).toBe(true);
  });

  it('returns true when `subsidyType` is COUPON && 1 coupon request is found', () => {
    const courseId = '123';
    const context = {
      subsidyRequestConfiguration: {
        subsidyRequestsEnabled: true,
        subsidyType: SUBSIDY_TYPE.COUPON,
      },
      requestsBySubsidyType: {
        [SUBSIDY_TYPE.LICENSE]: [],
        [SUBSIDY_TYPE.COUPON]: [{ state: SUBSIDY_REQUEST_STATE.REQUESTED, courseId }],
      },
    };
    const wrapper = ({ children }) => (/* eslint-disable react/prop-types */
      <SubsidyRequestsContext.Provider value={context}>{children}</SubsidyRequestsContext.Provider>
    );
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse(courseId), { wrapper });
    expect(result.current).toBe(true);
  });

  it('returns false when `subsidyType` is COUPON && no matching courseId', () => {
    const context = {
      subsidyRequestConfiguration: {
        subsidyRequestsEnabled: true,
        subsidyType: SUBSIDY_TYPE.COUPON,
      },
      requestsBySubsidyType: {
        [SUBSIDY_TYPE.LICENSE]: [],
        [SUBSIDY_TYPE.COUPON]: [{ state: SUBSIDY_REQUEST_STATE.REQUESTED, courseId: 'lorem' }],
      },
    };
    const wrapper = ({ children }) => (/* eslint-disable react/prop-types */
      <SubsidyRequestsContext.Provider value={context}>{children}</SubsidyRequestsContext.Provider>
    );
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse('ipsum'), { wrapper });
    expect(result.current).toBe(false);
  });
});
