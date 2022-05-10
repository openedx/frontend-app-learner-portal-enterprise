import { renderHook } from '@testing-library/react-hooks';

import moment from 'moment';
import { camelCaseObject } from '@edx/frontend-platform';
import { useCourseEnrollmentUrl, useUserHasSubsidyRequestForCourse, useAllCourseData } from '../hooks';
import { SubsidyRequestsContext } from '../../../enterprise-subsidy-requests/SubsidyRequestsContextProvider';
import { SUBSIDY_TYPE, SUBSIDY_REQUEST_STATE } from '../../../enterprise-subsidy-requests/constants';
import { LICENSE_SUBSIDY_TYPE, OFFER_SUBSIDY_TYPE } from '../constants';

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

const mockOffersForCourse = [{
  catalog: 'catalog-1',
  couponStartDate: moment().subtract(1, 'w').toISOString(),
  couponEndDate: moment().add(8, 'w').toISOString(),
}];

const mockCourseRecommendataions = {
  allRecommendations: [],
};

const mockCourseService = {
  fetchAllCourseData: jest.fn(() => mockCourseData),
  fetchUserLicenseSubsidy: jest.fn(() => ({ data: mockLicenseForCourse })),
  fetchAllCourseRecommendations: jest.fn(() => mockCourseRecommendataions),
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
    offers: [],
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

    expect(result.current.courseRecommendations).toEqual(mockCourseRecommendataions);
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
      offers: mockOffersForCourse,
    }));
    await waitForNextUpdate();

    expect(result.current.courseData).toEqual({
      ...mockCourseData,
      userSubsidyApplicableToCourse: {
        discountType: mockOffersForCourse[0].usageType,
        discountValue: mockOffersForCourse[0].benefitValue,
        startDate: mockOffersForCourse[0].couponStartDate,
        endDate: mockOffersForCourse[0].couponEndDate,
        subsidyType: OFFER_SUBSIDY_TYPE,
      },
    });
  });

  it('returns license subsidy if there is both an applicable license and coupon for the course', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAllCourseData({
      ...basicProps,
      subscriptionLicense: mockLicenseForCourse,
      offers: mockOffersForCourse,
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
  const noSubscriptionEnrollmentInputs = {
    enterpriseConfig: {
      uuid: 'foo',
    },
    key: 'bar',
    offers: [{
      code: 'bearsRus',
      catalog: 'bears',
      couponStartDate: moment().subtract(1, 'w').toISOString(),
      couponEndDate: moment().add(8, 'w').toISOString(),
    }],
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
