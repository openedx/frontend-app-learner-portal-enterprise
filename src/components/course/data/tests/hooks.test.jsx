import { renderHook } from '@testing-library/react-hooks';
import { render, screen } from '@testing-library/react';
import moment from 'moment';
import { camelCaseObject } from '@edx/frontend-platform';
import {
  MemoryRouter,
} from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import {
  useCourseEnrollmentUrl,
  useUserHasSubsidyRequestForCourse,
  useAllCourseData,
  useOptimizelyEnrollmentClickHandler,
  useCoursePartners,
  useCourseRunWeeksToComplete,
  useCourseTranscriptLanguages,
  useCoursePacingType,
  useCoursePriceForUserSubsidy,
  useExtractAndRemoveSearchParamsFromURL,
} from '../hooks';
import { SubsidyRequestsContext } from '../../../enterprise-subsidy-requests/SubsidyRequestsContextProvider';
import { SUBSIDY_TYPE, SUBSIDY_REQUEST_STATE } from '../../../enterprise-subsidy-requests/constants';
import {
  LICENSE_SUBSIDY_TYPE,
  COUPON_CODE_SUBSIDY_TYPE,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
} from '../constants';
import * as optimizelyUtils from '../../../../utils/optimizely';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('../../../../config', () => ({
  features: { ENROLL_WITH_CODES: true },
}));

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

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

const mockBaseEnterpriseOffer = {
  usageType: 'Percentage',
  enterpriseCatalogUuid: 'catalog-1',
  discountValue: 100,
  startDatetime: '2022-10-01T00:00:00Z',
  endDatetime: '2023-10-01T00:00:00Z',
  maxDiscount: null,
  maxUserDiscount: null,
  remainingBalance: null,
  remainingBalanceForUser: null,
};
const mockEnterpriseOffersForCourse = {
  noBookingsLimit: {
    ...mockBaseEnterpriseOffer,
    startDatetime: '2020-10-01T00:00:00Z',
    endDatetime: '2021-10-01T00:00:00Z',
  },
  userBookingsLimit: {
    ...mockBaseEnterpriseOffer,
    maxUserDiscount: 250,
    remainingBalanceForUser: 250,
    startDatetime: '2021-10-01T00:00:00Z',
    endDatetime: '2022-10-01T00:00:00Z',
  },
  globalBookingsLimit: {
    ...mockBaseEnterpriseOffer,
    maxDiscount: 1000,
    remainingBalance: 1000,
  },
};

const mockCourseRecommendataions = {
  all_recommendations: ['edX+DemoX'],
  same_partner_recommendations: ['edX+DemoX'],
};

const mockCourseService = {
  fetchAllCourseData: jest.fn(() => mockCourseData),
  fetchUserLicenseSubsidy: jest.fn(() => ({ data: mockLicenseForCourse })),
  fetchAllCourseRecommendations: jest.fn(() => mockCourseRecommendataions),
  fetchFilteredRecommendations: jest.fn(() => mockCourseRecommendataions),
  activeCourseRun: {
    firstEnrollablePaidSeatPrice: 100,
  },
};

jest.mock('../service', () => ({
  __esModule: true,
  default: jest.fn(() => mockCourseService),
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
    enterpriseOffers: [],
    canEnrollWithEnterpriseOffers: false,
    activeCatalogs: [],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

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

  it('returns null if no courseKey or enterpriseConfig is provided', async () => {
    const { result } = renderHook(() => useAllCourseData({
      ...basicProps,
      courseKey: null,
      enterpriseConfig: null,
    }));

    expect(result.current.courseData).toBeFalsy();
    expect(result.current.courseRecommendations).toBeFalsy();
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

  it('handles non 404 errors fetching All course data', async () => {
    const mockError = new Error('error');
    mockCourseService.fetchAllCourseData.mockRejectedValueOnce(mockError);
    const { result, waitForNextUpdate } = renderHook(() => useAllCourseData({
      ...basicProps,
    }));
    await waitForNextUpdate();

    expect(mockCourseService.fetchAllCourseData).toHaveBeenCalled();
    expect(result.current.fetchError).toEqual(mockError);
  });

  it('handles non 404 errors fetching All course recommendations', async () => {
    const mockError = new Error('error');
    mockCourseService.fetchAllCourseRecommendations.mockRejectedValueOnce(mockError);
    const { result, waitForNextUpdate } = renderHook(() => useAllCourseData({
      ...basicProps,
      activeCatalogs: null,
    }));

    await waitForNextUpdate();
    expect(result.current.courseData).toEqual({
      ...mockCourseData,
      userSubsidyApplicableToCourse: null,
    });

    expect(mockCourseService.fetchAllCourseData).toHaveBeenCalled();
    expect(mockCourseService.fetchAllCourseRecommendations).toHaveBeenCalledWith(null);
    expect(logError).toHaveBeenCalledWith(mockError);
    expect(result.current.courseRecommendations).toEqual([]);
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

  describe('learner credit subsidy', () => {
    it('returns learner credit subsidy if there is an applicable enterprise offer', async () => {
      const offers = [mockEnterpriseOffersForCourse.globalBookingsLimit];
      const { result, waitForNextUpdate } = renderHook(() => useAllCourseData({
        ...basicProps,
        enterpriseOffers: offers,
        canEnrollWithEnterpriseOffers: true,
      }));
      await waitForNextUpdate();

      expect(result.current.courseData).toEqual({
        ...mockCourseData,
        userSubsidyApplicableToCourse: {
          discountType: mockBaseEnterpriseOffer.usageType.toLowerCase(),
          discountValue: mockBaseEnterpriseOffer.discountValue,
          startDate: mockEnterpriseOffersForCourse.globalBookingsLimit.startDatetime,
          endDate: mockEnterpriseOffersForCourse.globalBookingsLimit.endDatetime,
          subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
        },
      });
    });

    it('prefers offers with no bookings limits over all other offers', async () => {
      const offers = [
        mockEnterpriseOffersForCourse.globalBookingsLimit,
        mockEnterpriseOffersForCourse.noBookingsLimit,
      ];
      const { result, waitForNextUpdate } = renderHook(() => useAllCourseData({
        ...basicProps,
        enterpriseOffers: offers,
        canEnrollWithEnterpriseOffers: true,
      }));
      await waitForNextUpdate();

      expect(result.current.courseData).toEqual({
        ...mockCourseData,
        userSubsidyApplicableToCourse: {
          discountType: mockBaseEnterpriseOffer.usageType.toLowerCase(),
          discountValue: mockBaseEnterpriseOffer.discountValue,
          startDate: mockEnterpriseOffersForCourse.noBookingsLimit.startDatetime,
          endDate: mockEnterpriseOffersForCourse.noBookingsLimit.endDatetime,
          subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
        },
      });
    });

    it('prefers offers with user bookings limit over global bookings limit', async () => {
      const offers = [
        mockEnterpriseOffersForCourse.globalBookingsLimit,
        mockEnterpriseOffersForCourse.userBookingsLimit,
      ];
      const { result, waitForNextUpdate } = renderHook(() => useAllCourseData({
        ...basicProps,
        enterpriseOffers: offers,
        canEnrollWithEnterpriseOffers: true,
      }));
      await waitForNextUpdate();

      expect(result.current.courseData).toEqual({
        ...mockCourseData,
        userSubsidyApplicableToCourse: {
          discountType: mockBaseEnterpriseOffer.usageType.toLowerCase(),
          discountValue: mockBaseEnterpriseOffer.discountValue,
          startDate: mockEnterpriseOffersForCourse.userBookingsLimit.startDatetime,
          endDate: mockEnterpriseOffersForCourse.userBookingsLimit.endDatetime,
          subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
        },
      });
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
    courseRunKey: 'bar',
    couponCodes: [mockCouponCode],
    sku: 'xkcd',
    location: { search: 'foo' },

  };
  // just skip the coupon codes here to ensure we process absence correctly
  const noCouponCodesEnrollmentInputs = {
    enterpriseConfig: {
      uuid: 'foo',
    },
    courseRunKey: 'bar',
    sku: 'xkcd',
    catalogList: ['bears'],
    location: { search: 'foo' },
  };
  const withLicenseEnrollmentInputs = {
    ...noLicenseEnrollmentInputs,
    userSubsidyApplicableToCourse: {
      subsidyType: LICENSE_SUBSIDY_TYPE,
      subsidyId: 'license-uuid',
    },
  };

  describe('subscription license', () => {
    test('returns an lms url to DSC for enrollment with a license', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl(withLicenseEnrollmentInputs));
      expect(result.current).toContain(process.env.LMS_BASE_URL);
      expect(result.current).toContain(withLicenseEnrollmentInputs.enterpriseConfig.uuid);
      expect(result.current).toContain(withLicenseEnrollmentInputs.key);
      expect(result.current).toContain(withLicenseEnrollmentInputs.userSubsidyApplicableToCourse.subsidyId);
    });

    test('does not use the license uuid for enrollment if there is no valid license subsidy (even with a license uuid)', () => {
      const noSubsidyEnrollmentInputs = { ...withLicenseEnrollmentInputs };
      delete noSubsidyEnrollmentInputs.userSubsidyApplicableToCourse;

      const { result } = renderHook(() => useCourseEnrollmentUrl(noSubsidyEnrollmentInputs));
      expect(result.current).not.toContain(withLicenseEnrollmentInputs.userSubsidyApplicableToCourse.subsidyId);
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
    const wrapper = ({ children }) => (
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
    const wrapper = ({ children }) => (
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
    const wrapper = ({ children }) => (
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
    const wrapper = ({ children }) => (
      <SubsidyRequestsContext.Provider value={context}>{children}</SubsidyRequestsContext.Provider>
    );
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse('ipsum'), { wrapper });
    expect(result.current).toBe(false);
  });
});

describe('useOptimizelyEnrollmentClickHandler', () => {
  const basicProps = {
    courseRunKey: 'courseRunKey',
    href: 'http://example.com',
    courseEnrollmentsByStatus: {},
  };

  afterEach(() => jest.clearAllMocks());

  it('sends correct optimizely event', () => {
    const pushEventSpy = jest.spyOn(optimizelyUtils, 'pushEvent').mockImplementation(() => true);
    const { result } = renderHook(() => useOptimizelyEnrollmentClickHandler(basicProps));
    result.current({ preventDefault: jest.fn() });
    expect(pushEventSpy).toHaveBeenCalledTimes(2);
    expect(pushEventSpy).toHaveBeenNthCalledWith(1, 'enterprise_learner_portal_enrollment_click', { courseKey: 'courseRunKey' });
    expect(pushEventSpy).toHaveBeenNthCalledWith(2, 'enterprise_learner_portal_first_enrollment_click', { courseKey: 'courseRunKey' });
  });
});

describe('useCoursePartners', () => {
  const CoursePartners = ({ course }) => {
    const [partners, label] = useCoursePartners(course);

    return (
      <div>
        <h2>{label}</h2>
        <ul>
          {partners.map((partner) => (
            <li key={partner}>{partner}</li>
          ))}
        </ul>
      </div>
    );
  };
  it('should set multiple partners and label correctly', async () => {
    const course = { owners: ['Partner 1', 'Partner 2'] };
    render(<CoursePartners course={course} />);

    expect(screen.getByText('Partner 1')).toBeTruthy();
    expect(screen.getByText('Partner 2')).toBeTruthy();
    expect(screen.getByText('Institutions')).toBeTruthy();
  });
  it('should set a single partners and label correctly', async () => {
    const course = { owners: ['Partner 3'] };
    render(<CoursePartners course={course} />);

    expect(screen.getByText('Partner 3')).toBeTruthy();
    expect(screen.getByText('Institution')).toBeTruthy();
  });
});

describe('useCourseRunWeeksToComplete', () => {
  it('should return the correct weeksToComplete and label', () => {
    const courseRun = { weeksToComplete: 4 };
    const { result } = renderHook(() => useCourseRunWeeksToComplete(courseRun));
    expect(result.current[0]).toBe(4);
    expect(result.current[1]).toBe('weeks');
  });
  it('should handle 0 weekToComplete', () => {
    const courseRun = { weeksToComplete: 0 };
    const { result } = renderHook(() => useCourseRunWeeksToComplete(courseRun));
    expect(result.current[0]).toBe(0);
    expect(result.current[1]).toBe('weeks');
  });
  it('should handle 1 weekToComplete', () => {
    const courseRun = { weeksToComplete: 1 };
    const { result } = renderHook(() => useCourseRunWeeksToComplete(courseRun));
    expect(result.current[0]).toBe(1);
    expect(result.current[1]).toBe('week');
  });
  it('should handle undefined courseRun', () => {
    const { result } = renderHook(() => useCourseRunWeeksToComplete(undefined));
    expect(result.current[0]).toBe(undefined);
    expect(result.current[1]).toBe(undefined);
  });
  it('should handle courseRun with no weeksToComplete', () => {
    const courseRun = {};
    const { result } = renderHook(() => useCourseRunWeeksToComplete(courseRun));
    expect(result.current[0]).toBe(undefined);
    expect(result.current[1]).toBe(undefined);
  });
});

describe('useCourseTranscriptLanguages', () => {
  it('sets the correct state when the course run has transcript languages', () => {
    const courseRun = {
      transcriptLanguages: ['en', 'fr'],
    };
    const { result } = renderHook(() => useCourseTranscriptLanguages(courseRun));

    expect(result.current[0]).toEqual(['en', 'fr']);
    expect(result.current[1]).toEqual('Video Transcripts');
  });

  it('sets the correct state when the course run has a single transcript language', () => {
    const courseRun = {
      transcriptLanguages: ['en'],
    };
    const { result } = renderHook(() => useCourseTranscriptLanguages(courseRun));

    expect(result.current[0]).toEqual(['en']);
    expect(result.current[1]).toEqual('Video Transcript');
  });

  it('does not set state when course run is undefined', () => {
    const { result } = renderHook(() => useCourseTranscriptLanguages(undefined));

    expect(result.current[0]).toEqual([]);
    expect(result.current[1]).toEqual(undefined);
  });

  it('does not set state when course run has no transcriptLanguages property', () => {
    const courseRun = {};
    const { result } = renderHook(() => useCourseTranscriptLanguages(courseRun));

    expect(result.current[0]).toEqual([]);
    expect(result.current[1]).toEqual(undefined);
  });
});

describe('CoursePacingType', () => {
  const CoursePacingType = ({ courseRun }) => {
    const [pacingType, pacingTypeContent] = useCoursePacingType(courseRun);

    return (
      <div>
        <h3>Pacing Type</h3>
        <p>{pacingType}</p>
        <p>{pacingTypeContent}</p>
      </div>
    );
  };
  it('should display the correct pacing type and content when passed a self-paced course', () => {
    const courseRun = { pacingType: 'self_paced' };
    render(<CoursePacingType courseRun={courseRun} />);

    expect(screen.getByText('Pacing Type')).toBeTruthy();
    expect(screen.getByText('self_paced')).toBeTruthy();
    expect(screen.getByText('Self-paced on your time')).toBeTruthy();
  });

  it('should display the correct pacing type and content when passed an instructor-paced course', () => {
    const courseRun = { pacingType: 'instructor_paced' };
    render(<CoursePacingType courseRun={courseRun} />);

    expect(screen.getByText('Pacing Type')).toBeTruthy();
    expect(screen.getByText('instructor_paced')).toBeTruthy();
    expect(screen.getByText('Instructor-led on a course schedule')).toBeTruthy();
  });
});

describe('useCoursePriceForUserSubsidy', () => {
  it('should return the correct course price when a user subsidy is applicable with percentage discount', () => {
    const activeCourseRun = { firstEnrollablePaidSeatPrice: 100 };
    const userSubsidyApplicableToCourse = {
      discountType: 'percentage',
      discountValue: 10,
      expirationDate: '2025-12-31',
      startDate: '2020-01-01',
      subsidyId: '123',
    };
    const { result } = renderHook(() => useCoursePriceForUserSubsidy({
      activeCourseRun,
      userSubsidyApplicableToCourse,
    }));
    const [coursePrice] = result.current;
    expect(coursePrice).toEqual({ list: 100, discounted: 90 });
  });

  it('should return the correct course price when a user subsidy is applicable with absolute discount', () => {
    const activeCourseRun = { firstEnrollablePaidSeatPrice: 150 };
    const userSubsidyApplicableToCourse = {
      discountType: 'absolute',
      discountValue: 10,
      expirationDate: '2025-12-31',
      startDate: '2020-01-01',
      subsidyId: '123',
    };
    const { result } = renderHook(() => useCoursePriceForUserSubsidy({
      activeCourseRun,
      userSubsidyApplicableToCourse,
    }));
    const [coursePrice] = result.current;
    expect(coursePrice).toEqual({ list: 150, discounted: 140 });
  });

  it('should return the correct course price when a user subsidy is not applicable', () => {
    const activeCourseRun = { firstEnrollablePaidSeatPrice: 100 };
    const userSubsidyApplicableToCourse = null;
    const { result } = renderHook(() => useCoursePriceForUserSubsidy({
      activeCourseRun,
      userSubsidyApplicableToCourse,
    }));
    const [coursePrice] = result.current;
    expect(coursePrice).toEqual({ list: 100 });
  });

  it('should return the correct currency', () => {
    const activeCourseRun = { firstEnrollablePaidSeatPrice: 100 };
    const userSubsidyApplicableToCourse = null;
    const { result } = renderHook(() => useCoursePriceForUserSubsidy({
      activeCourseRun,
      userSubsidyApplicableToCourse,
    }));
    const [, currency] = result.current;
    expect(currency).toEqual('USD');
  });
  it('should return null if no list price is', () => {
    const activeCourseRun = {};
    const userSubsidyApplicableToCourse = null;
    const { result } = renderHook(() => useCoursePriceForUserSubsidy({
      activeCourseRun,
      userSubsidyApplicableToCourse,
    }));
    const [coursePrice] = result.current;
    expect(coursePrice).toEqual(null);
  });
});

describe('useExtractAndRemoveSearchParamsFromURL', () => {
  const TestComponent = () => {
    const algoliaSearchParams = useExtractAndRemoveSearchParamsFromURL();

    return (
      <div>
        <p>Query ID: {algoliaSearchParams.queryId}</p>
        <p>Object ID: {algoliaSearchParams.objectId}</p>
      </div>
    );
  };
  it('should display the queryId and objectId from the URL search params', () => {
    render(
      <MemoryRouter initialEntries={['/?queryId=123&objectId=abc']}>
        <TestComponent />
      </MemoryRouter>,
    );
    expect(screen.getByText('Query ID: 123')).toBeTruthy();
    expect(screen.getByText('Object ID: abc')).toBeTruthy();
  });
});
