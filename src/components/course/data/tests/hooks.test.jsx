import { renderHook } from '@testing-library/react-hooks';

import moment from 'moment';
import { camelCaseObject } from '@edx/frontend-platform';
import { useCourseEnrollmentUrl, useUserHasSubsidyRequestForCourse, useAllCourseData } from '../hooks';
import { SubsidyRequestsContext } from '../../../enterprise-subsidy-requests/SubsidyRequestsContextProvider';
import { SUBSIDY_TYPE, SUBSIDY_REQUEST_STATE } from '../../../enterprise-subsidy-requests/constants';
import { LICENSE_SUBSIDY_TYPE, COUPON_CODE_SUBSIDY_TYPE } from '../constants';

jest.mock('../../../../config', () => ({
  features: { ENROLL_WITH_CODES: true },
}));

const mockCourseData = {
  catalog: {
    containsContentItems: true,
    catalogList: ['catalog-1'],
  },
};

const mockLicenseForCourse = {
  uuid: 'license-uuid',
  start_date: moment().subtract(1, 'w').toISOString(),
  expiration_date: moment().add(8, 'w').toISOString(),
};

const mockCouponCodesForCourse = [{
  catalog: 'catalog-1',
  couponStartDate: moment().subtract(1, 'w').toISOString(),
  couponEndDate: moment().add(8, 'w').toISOString(),
}];

const mockCourseRecommendataions = {
  all_recommendations: ['edX+DemoX'],
  same_partner_recommendations: ['edX+DemoX'],
};

const mockCourseService = {
  fetchAllCourseData: jest.fn(() => mockCourseData),
  fetchUserLicenseSubsidy: jest.fn(() => ({ data: mockLicenseForCourse })),
  fetchAllCourseRecommendations: jest.fn(() => mockCourseRecommendataions),
  fetchFilteredRecommendations: jest.fn(() => mockCourseRecommendataions),
};

jest.mock('../service', () => ({
  __esModule: true,
  default: () => mockCourseService,
}));

describe('useAllCourseData', () => {
  const basicProps = {
    courseKey: 'courseKey',
    enterpriseConfig: {
      uuid: 'uuid',
    },
    courseRunKey: 'courseRunKey',
    subscriptionLicense: null,
    couponCodes: [],
  };

  afterEach(() => jest.clearAllMocks());

  it('returns course data and course recommendations', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAllCourseData(basicProps));

    await waitForNextUpdate();
    expect(result.current.courseData).toEqual({
      ...mockCourseData,
      userSubsidyApplicableToCourse: null,
    });

    expect(mockCourseService.fetchAllCourseData).toHaveBeenCalled();
    expect(mockCourseService.fetchAllCourseRecommendations).toHaveBeenCalled();

    expect(result.current.courseRecommendations).toEqual(camelCaseObject(mockCourseRecommendataions));
  });

  it('returns license subsidy if there is an applicable license for the course', async () => {
    const subscriptionLicense = {
      uuid: 'license-uuid',
    };
    const { result, waitForNextUpdate } = renderHook(() => useAllCourseData({
      ...basicProps,
      subscriptionLicense,
    }));
    await waitForNextUpdate();

    expect(mockCourseService.fetchUserLicenseSubsidy).toHaveBeenCalled();
    expect(result.current.courseData).toEqual({
      ...mockCourseData,
      userSubsidyApplicableToCourse: {
        ...camelCaseObject(mockLicenseForCourse),
        subsidyType: LICENSE_SUBSIDY_TYPE,
      },
    });
  });

  it('handles non 404 errors fetching user license subsidy', async () => {
    const mockError = new Error('error');
    mockCourseService.fetchUserLicenseSubsidy.mockRejectedValueOnce(mockError);
    const subscriptionLicense = {
      uuid: 'license-uuid',
    };
    const { result, waitForNextUpdate } = renderHook(() => useAllCourseData({
      ...basicProps,
      subscriptionLicense,
    }));
    await waitForNextUpdate();

    expect(mockCourseService.fetchUserLicenseSubsidy).toHaveBeenCalled();
    expect(result.current.fetchError).toEqual(mockError);
  });

  it('returns coupon subsidy if there is an applicable coupon for the course', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAllCourseData({
      ...basicProps,
      couponCodes: mockCouponCodesForCourse,
    }));
    await waitForNextUpdate();

    expect(result.current.courseData).toEqual({
      ...mockCourseData,
      userSubsidyApplicableToCourse: {
        discountType: mockCouponCodesForCourse[0].usageType,
        discountValue: mockCouponCodesForCourse[0].benefitValue,
        startDate: mockCouponCodesForCourse[0].couponStartDate,
        endDate: mockCouponCodesForCourse[0].couponEndDate,
        subsidyType: COUPON_CODE_SUBSIDY_TYPE,
      },
    });
  });

  it('returns license subsidy if there is both an applicable license and coupon for the course', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAllCourseData({
      ...basicProps,
      subscriptionLicense: mockLicenseForCourse,
      couponCodes: mockCouponCodesForCourse,
    }));
    await waitForNextUpdate();

    expect(mockCourseService.fetchUserLicenseSubsidy).toHaveBeenCalled();
    expect(result.current.courseData).toEqual({
      ...mockCourseData,
      userSubsidyApplicableToCourse: {
        ...camelCaseObject(mockLicenseForCourse),
        subsidyType: LICENSE_SUBSIDY_TYPE,
      },
    });
  });
});

describe('useCourseEnrollmentUrl', () => {
  const mockCouponCode = {
    code: 'bearsRus',
    catalog: 'bears',
    couponStartDate: moment().subtract(1, 'w').toISOString(),
    couponEndDate: moment().add(8, 'w').toISOString(),
  };
  const noLicenseEnrollmentInputs = {
    enterpriseConfig: {
      uuid: 'foo',
    },
    key: 'bar',
    couponCodes: [mockCouponCode],
    sku: 'xkcd',
    location: { search: 'foo' },
  };
  // just skip the coupon codes here to ensure we process absence correctly
  const noCouponCodesEnrollmentInputs = {
    enterpriseConfig: {
      uuid: 'foo',
    },
    key: 'bar',
    sku: 'xkcd',
    catalogList: ['bears'],
    location: { search: 'foo' },
  };
  const withLicenseEnrollmentInputs = {
    ...noLicenseEnrollmentInputs,
    subscriptionLicense: {
      uuid: 'yes',
    },
    userSubsidyApplicableToCourse: {
      subsidyType: LICENSE_SUBSIDY_TYPE,
    },
  };

  describe('subscription license', () => {
    test('returns an lms url to DSC for enrollment with a license', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl(withLicenseEnrollmentInputs));
      expect(result.current).toContain(process.env.LMS_BASE_URL);
      expect(result.current).toContain(withLicenseEnrollmentInputs.enterpriseConfig.uuid);
      expect(result.current).toContain(withLicenseEnrollmentInputs.key);
      expect(result.current).toContain(withLicenseEnrollmentInputs.subscriptionLicense.uuid);
    });

    test('does not use the license uuid for enrollment if there is no valid license subsidy (even with a license uuid)', () => {
      const noSubsidyEnrollmentInputs = { ...withLicenseEnrollmentInputs };
      delete noSubsidyEnrollmentInputs.userSubsidyApplicableToCourse;

      const { result } = renderHook(() => useCourseEnrollmentUrl(noSubsidyEnrollmentInputs));
      expect(result.current).not.toContain(withLicenseEnrollmentInputs.subscriptionLicense.uuid);
    });
  });

  describe('coupon codes', () => {
    test('with coupon codes for course returns ecommerce url to redeem product with code', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noLicenseEnrollmentInputs,
        userSubsidyApplicableToCourse: {
          code: mockCouponCode.code,
          subsidyType: COUPON_CODE_SUBSIDY_TYPE,
        },
      }));
      expect(result.current).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(result.current).toContain(noLicenseEnrollmentInputs.sku);
      expect(result.current).toContain(noLicenseEnrollmentInputs.couponCodes[0].code);
      expect(result.current).toContain(withLicenseEnrollmentInputs.key);
    });

    test('with no coupon codes returns ecommerce url to add product to basket', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noLicenseEnrollmentInputs,
        couponCodes: [],

      }));
      expect(result.current).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(result.current).toContain(noLicenseEnrollmentInputs.sku);
      expect(result.current).toContain(withLicenseEnrollmentInputs.key);
      expect(result.current).not.toContain('code');
    });

    test('with no coupon codes passed, treats it as empty and does not fail', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noCouponCodesEnrollmentInputs,
      }));
      expect(result.current).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(result.current).toContain(noLicenseEnrollmentInputs.sku);
      expect(result.current).toContain(withLicenseEnrollmentInputs.key);
      expect(result.current).not.toContain('code');
    });

    test('with missing product sku returns null', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noLicenseEnrollmentInputs,
        sku: undefined,
      }));
      expect(result.current).toBeNull();
    });

    test('includes failure url in query params', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noCouponCodesEnrollmentInputs,
      }));
      expect(result.current.includes('failure_url'));
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
