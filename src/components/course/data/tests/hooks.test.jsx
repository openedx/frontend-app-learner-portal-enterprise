import { renderHook } from '@testing-library/react-hooks';
import { render, screen } from '@testing-library/react';
import moment from 'moment';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import {
  useCourseEnrollmentUrl,
  useUserHasSubsidyRequestForCourse,
  useAllCourseData,
  useOptimizelyEnrollmentClickHandler,
  useTrackSearchConversionClickHandler,
  useCoursePartners,
  useCourseRunWeeksToComplete,
  useCourseTranscriptLanguages,
  useCoursePacingType,
  useCoursePriceForUserSubsidy,
  useExtractAndRemoveSearchParamsFromURL,
  useCourseSubjects,
  useCheckSubsidyAccessPolicyRedeemability,
  useUserSubsidyApplicableToCourse,
} from '../hooks';
import {
  getCourseRunPrice,
  findCouponCodeForCourse,
  findEnterpriseOfferForCourse,
  getSubsidyToApplyForCourse,
} from '../utils';
import { SubsidyRequestsContext } from '../../../enterprise-subsidy-requests/SubsidyRequestsContextProvider';
import { SUBSIDY_TYPE, SUBSIDY_REQUEST_STATE } from '../../../enterprise-subsidy-requests/constants';
import {
  LICENSE_SUBSIDY_TYPE,
  COUPON_CODE_SUBSIDY_TYPE,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
} from '../constants';
import {
  mockCourseService,
  mockCourseData,
  mockCourseRecommendations,
  mockCourseServiceUninitialized,
  mockLmsUserId,
  mockCourseRunKey,
  mockCanRedeemData,
  mockSubscriptionLicense,
  mockUserLicenseSubsidy,
} from '../../tests/constants';
import * as optimizelyUtils from '../../../../utils/optimizely';
import { CourseContext } from '../../CourseContextProvider';

const oldGlobalLocation = global.location;

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(() => ({ id: mockLmsUserId })),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
  hasFeatureFlagEnabled: jest.fn(() => true),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn().mockReturnValue({ data: undefined, isInitialLoading: false }),
}));

jest.mock('../../../../config', () => ({
  features: { ENROLL_WITH_CODES: true },
}));

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  getCourseRunPrice: jest.fn(),
  getSubsidyToApplyForCourse: jest.fn(),
  findCouponCodeForCourse: jest.fn(),
  findEnterpriseOfferForCourse: jest.fn(),
}));

jest.useFakeTimers();

jest.mock('../service', () => ({
  __esModule: true,
  default: jest.fn(() => mockCourseService),
}));

const createGlobalLocationMock = () => {
  delete global.location;
  global.location = Object.defineProperties(
    {},
    {
      ...Object.getOwnPropertyDescriptors(oldGlobalLocation),
      assign: {
        configurable: true,
        value: jest.fn(),
      },
    },
  );
};
const mockPreventDefault = jest.fn();

const queryClient = new QueryClient();

describe('useAllCourseData', () => {
  const basicProps = {
    courseService: mockCourseService,
    activeCatalogs: [],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns course data, course recommendations, and course reviews', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAllCourseData(basicProps));

    await waitForNextUpdate();
    expect(result.current.courseData).toEqual(mockCourseData);

    expect(mockCourseService.fetchAllCourseData).toHaveBeenCalled();
    expect(mockCourseService.fetchAllCourseRecommendations).toHaveBeenCalled();
    expect(mockCourseService.fetchCourseReviews).toHaveBeenCalled();

    expect(result.current.courseRecommendations).toEqual(camelCaseObject(mockCourseRecommendations));
  });

  it('returns null if no courseKey or enterpriseConfig is provided', async () => {
    const { result } = renderHook(() => useAllCourseData({
      ...basicProps,
      courseService: mockCourseServiceUninitialized,
    }));

    expect(result.current.courseData).toBeFalsy();
    expect(result.current.courseRecommendations).toBeFalsy();
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

  it('handles non 404 errors fetching course recommendations', async () => {
    const mockError = new Error('error');
    mockCourseService.fetchAllCourseRecommendations.mockRejectedValueOnce(mockError);
    const { result, waitForNextUpdate } = renderHook(() => useAllCourseData({
      ...basicProps,
      activeCatalogs: null,
    }));

    await waitForNextUpdate();
    expect(result.current.courseData).toEqual(mockCourseData);

    expect(mockCourseService.fetchAllCourseRecommendations).toHaveBeenCalledWith(null);
    expect(logError).toHaveBeenCalledWith(mockError);
    expect(result.current.courseRecommendations).toEqual([]);
  });

  it('handles non 404 errors fetching course reviews', async () => {
    const mockError = new Error('error');
    mockCourseService.fetchCourseReviews.mockRejectedValueOnce(mockError);
    const { result, waitForNextUpdate } = renderHook(() => useAllCourseData({
      ...basicProps,
      activeCatalogs: null,
    }));

    await waitForNextUpdate();
    expect(result.current.courseData).toEqual(mockCourseData);

    expect(mockCourseService.fetchCourseReviews).toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith(mockError);
    expect(result.current.courseReviews).toEqual(undefined);
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

  beforeAll(() => {
    createGlobalLocationMock();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // restore `global.location` to the `jsdom` `Location` object
    global.location = oldGlobalLocation;
  });

  it('sends correct optimizely event', async () => {
    const pushEventSpy = jest.spyOn(optimizelyUtils, 'pushEvent').mockImplementation(() => true);
    const { result, waitFor } = renderHook(() => useOptimizelyEnrollmentClickHandler(basicProps));

    const outputClickHandler = result.current;
    outputClickHandler({ preventDefault: mockPreventDefault });

    expect(pushEventSpy).toHaveBeenCalledTimes(2);
    expect(pushEventSpy).toHaveBeenNthCalledWith(1, 'enterprise_learner_portal_enrollment_click', { courseKey: 'courseRunKey' });
    expect(pushEventSpy).toHaveBeenNthCalledWith(2, 'enterprise_learner_portal_first_enrollment_click', { courseKey: 'courseRunKey' });

    expect(mockPreventDefault).toHaveBeenCalledTimes(1);
    jest.runAllTimers();

    await waitFor(() => {
      expect(global.location.assign).toHaveBeenCalledTimes(1);
      expect(global.location.assign).toHaveBeenCalledWith(basicProps.href);
    });
  });
});

describe('useTrackSearchConversionClickHandler', () => {
  const mockEventName = 'edx.ui.enterprise.learner_portal.fake_event';
  const basicProps = {
    href: 'http://example.com',
    eventName: mockEventName,
  };

  const mockEnterpriseConfig = { uuid: 'test-enterprise-uuid' };
  const mockCourseState = {
    activeCourseRun: { key: 'course-run-key' },
    algoliaSearchParams: {
      queryId: 'algolia-query-id',
      objectId: 'algolia-object-id',
    },
  };
  const wrapper = ({ children }) => (
    <AppContext.Provider value={{ enterpriseConfig: mockEnterpriseConfig }}>
      <CourseContext.Provider value={{ state: mockCourseState }}>
        {children}
      </CourseContext.Provider>
    </AppContext.Provider>
  );

  beforeAll(() => {
    createGlobalLocationMock();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // restore `global.location` to the `jsdom` `Location` object
    global.location = oldGlobalLocation;
  });

  it('sends segment event and redirects', async () => {
    const { result, waitFor } = renderHook(
      () => useTrackSearchConversionClickHandler(basicProps),
      { wrapper },
    );

    const outputClickHandler = result.current;
    outputClickHandler({ preventDefault: mockPreventDefault });

    expect(mockPreventDefault).toHaveBeenCalledTimes(1);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseConfig.uuid,
      mockEventName,
      {
        products: [{ objectID: mockCourseState.algoliaSearchParams.objectId }],
        index: getConfig().ALGOLIA_INDEX_NAME,
        queryID: mockCourseState.algoliaSearchParams.queryId,
        courseKey: mockCourseState.activeCourseRun.key,
      },
    );

    jest.runAllTimers();

    await waitFor(() => {
      expect(global.location.assign).toHaveBeenCalledTimes(1);
      expect(global.location.assign).toHaveBeenCalledWith(basicProps.href);
    });
  });
});

describe('useCourseSubjects', () => {
  it('handles null course', async () => {
    const { result } = renderHook(() => useCourseSubjects());
    expect(result.current).toEqual({
      primarySubject: null,
      subjects: [],
    });
  });

  it('handles empty subjects list', async () => {
    const course = { subjects: [] };
    const { result } = renderHook(() => useCourseSubjects(course));
    expect(result.current).toEqual({
      primarySubject: null,
      subjects: [],
    });
  });

  it('handles course with subjects', async () => {
    const mockSubject = {
      name: 'Subject 1',
      slug: 'subject-1',
    };
    const course = { subjects: [mockSubject] };
    const { result } = renderHook(() => useCourseSubjects(course));
    expect(result.current).toEqual({
      primarySubject: {
        ...mockSubject,
        url: `${getConfig().MARKETING_SITE_BASE_URL}/course/subject/${mockSubject.slug}`,
      },
      subjects: [mockSubject],
    });
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

  it('should return the correct course price for exec ed course', () => {
    const execEdCourseEntitlements = [{
      price: 200,
    }];

    const activeCourseRun = { };
    const userSubsidyApplicableToCourse = null;
    const { result } = renderHook(() => useCoursePriceForUserSubsidy({
      courseEntitlements: execEdCourseEntitlements,
      activeCourseRun,
      userSubsidyApplicableToCourse,
    }));
    const [coursePrice] = result.current;
    expect(coursePrice).toEqual({ list: 200 });
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

describe('useCheckSubsidyAccessPolicyRedeemability', () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const baseArgs = {
    enterpriseUuid: 'test-enterprise-uuid',
    isQueryEnabled: true,
  };
  const argsWithCourseRunKeys = {
    ...baseArgs,
    courseRunKeys: [mockCourseRunKey],
  };
  const argsWithoutCourseRunKeys = {
    ...baseArgs,
    courseRunKeys: [],
  };
  const argsWithDisabledFeature = {
    ...baseArgs,
    isQueryEnabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    baseArgs,
    argsWithDisabledFeature,
    argsWithoutCourseRunKeys,
  ])('handles disabled query (%s)', (args) => {
    const { result } = renderHook(
      () => useCheckSubsidyAccessPolicyRedeemability(args),
      { wrapper },
    );
    expect(result.current.isInitialLoading).toBeDefined();
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['can-user-redeem-course', mockLmsUserId],
        enabled: false,
        queryFn: expect.any(Function),
      }),
    );
  });

  it('makes actual query to check redemption eligilibity', async () => {
    const { result } = renderHook(
      () => useCheckSubsidyAccessPolicyRedeemability(argsWithCourseRunKeys),
      { wrapper },
    );
    expect(result.current.isInitialLoading).toBeDefined();

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['can-user-redeem-course', mockLmsUserId, ...argsWithCourseRunKeys.courseRunKeys],
        enabled: true,
        queryFn: expect.any(Function),
      }),
    );

    const checkRedemptionEligiblity = useQuery.mock.calls[0][0].queryFn;
    const eligibility = await checkRedemptionEligiblity();
    expect(eligibility).toEqual(camelCaseObject(mockCanRedeemData));
  });
});

describe('useUserSubsidyApplicableToCourse', () => {
  const mockCatalogUUID = 'test-enterprise-catalog-uuid';
  const baseArgs = {
    courseService: mockCourseService,
    courseData: {
      catalog: {
        containsContentItems: true,
        catalogList: [mockCatalogUUID],
      },
      courseDetails: {
        uuid: 'test-course-uuid',
        key: 'edX+DemoX',
      },
    },
  };
  const argsWithMissingCourse = {
    ...baseArgs,
    courseData: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles null course data', () => {
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse(argsWithMissingCourse));
    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      legacyUserSubsidyApplicableToCourse: undefined,
    });
  });

  it('handles course data with redeemable subsidy access policy', async () => {
    const mockRedeemablePolicy = {
      perLearnerEnrollmentLimit: null,
      perLearnerSpendLimit: null,
      policyRedemptionUrl: 'http://policy-redemption.url',
    };
    const argsWithRedeemablePolicy = {
      ...baseArgs,
      isPolicyRedemptionEnabled: true,
      redeemableSubsidyAccessPolicy: mockRedeemablePolicy,
    };
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse(argsWithRedeemablePolicy));
    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
      }),
      legacyUserSubsidyApplicableToCourse: undefined,
    });
  });

  it('does not have redeemable subsidy access policy and catalog(s) does not contain course', () => {
    const args = {
      ...baseArgs,
      courseData: {
        ...baseArgs.courseData,
        catalog: {
          ...baseArgs.courseData.catalog,
          containsContentItems: false,
        },
      },
    };
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse(args));
    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      legacyUserSubsidyApplicableToCourse: undefined,
    });
  });

  it('finds applicable subscription license', async () => {
    getSubsidyToApplyForCourse.mockReturnValue({
      subsidyType: LICENSE_SUBSIDY_TYPE,
    });
    const args = {
      ...baseArgs,
      subscriptionLicense: mockSubscriptionLicense,
    };
    const { result, waitFor } = renderHook(() => useUserSubsidyApplicableToCourse(args));

    expect(mockCourseService.fetchUserLicenseSubsidy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(getSubsidyToApplyForCourse).toHaveBeenCalledTimes(1);
    });
    expect(getSubsidyToApplyForCourse).toHaveBeenCalledWith({
      applicableSubscriptionLicense: mockUserLicenseSubsidy,
      applicableCouponCode: undefined,
      applicableEnterpriseOffer: undefined,
    });

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: LICENSE_SUBSIDY_TYPE,
      }),
      legacyUserSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: LICENSE_SUBSIDY_TYPE,
      }),
    });
  });

  it('finds applicable coupon code', async () => {
    const mockCouponCode = {
      catalog: mockCatalogUUID,
      code: 'test-coupon-code',
      usageType: 'percentage',
      benefitValue: 100,
      couponStartDate: moment().format('YYYY-MM-DD'),
      couponEndDate: moment().add(1, 'year').format('YYYY-MM-DD'),
    };
    getSubsidyToApplyForCourse.mockReturnValueOnce({
      subsidyType: COUPON_CODE_SUBSIDY_TYPE,
    });
    findCouponCodeForCourse.mockReturnValueOnce(mockCouponCode);

    const args = {
      ...baseArgs,
      couponCodes: [mockCouponCode],
    };
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse(args));

    expect(findCouponCodeForCourse).toHaveBeenCalledTimes(1);
    expect(findCouponCodeForCourse).toHaveBeenCalledWith(args.couponCodes, args.courseData.catalog.catalogList);
    expect(getSubsidyToApplyForCourse).toHaveBeenCalledTimes(1);
    expect(getSubsidyToApplyForCourse).toHaveBeenCalledWith({
      applicableCouponCode: mockCouponCode,
    });

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: COUPON_CODE_SUBSIDY_TYPE,
      }),
      legacyUserSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: COUPON_CODE_SUBSIDY_TYPE,
      }),
    });
  });

  it('finds applicable enterprise offer', () => {
    const mockEnterpriseOffer = {
      catalog: mockCatalogUUID,
      code: 'test-coupon-code',
      usageType: 'percentage',
      benefitValue: 100,
      couponStartDate: moment().format('YYYY-MM-DD'),
      couponEndDate: moment().add(1, 'year').format('YYYY-MM-DD'),
    };
    const mockCoursePrice = 100;
    getCourseRunPrice.mockReturnValueOnce(mockCoursePrice);
    getSubsidyToApplyForCourse.mockReturnValueOnce({
      subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
    });
    findEnterpriseOfferForCourse.mockReturnValueOnce(mockEnterpriseOffer);

    const args = {
      ...baseArgs,
      canEnrollWithEnterpriseOffers: true,
      enterpriseOffers: [mockEnterpriseOffer],
    };
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse(args));

    expect(findEnterpriseOfferForCourse).toHaveBeenCalledTimes(1);
    expect(findEnterpriseOfferForCourse).toHaveBeenCalledWith({
      enterpriseOffers: args.enterpriseOffers,
      catalogList: args.courseData.catalog.catalogList,
      coursePrice: mockCoursePrice,
    });

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
      }),
      legacyUserSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
      }),
    });
  });
});
