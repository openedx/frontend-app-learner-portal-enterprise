import { renderHook } from '@testing-library/react-hooks';
import { render, screen, waitFor } from '@testing-library/react';
import {
  BrowserRouter, MemoryRouter, useLocation, useParams,
} from 'react-router-dom';
import dayjs from 'dayjs';
import { getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  useCourseEnrollmentUrl,
  useCoursePacingType,
  useCoursePartners,
  useCoursePriceForUserSubsidy,
  useCourseRunWeeksToComplete,
  useCourseTranscriptLanguages,
  useExtractAndRemoveSearchParamsFromURL,
  useIsCourseAssigned,
  useMinimalCourseMetadata,
  useOptimizelyEnrollmentClickHandler,
  useTrackSearchConversionClickHandler,
  useUserHasSubsidyRequestForCourse,
  useUserSubsidyApplicableToCourse,
} from '../hooks';
import {
  findCouponCodeForCourse,
  findEnterpriseOfferForCourse,
  getCourseTypeConfig,
  getMissingApplicableSubsidyReason,
  getSubscriptionDisabledEnrollmentReasonType,
  getSubsidyToApplyForCourse,
} from '../utils';
import {
  COUPON_CODE_SUBSIDY_TYPE,
  DISABLED_ENROLL_REASON_TYPES,
  DISABLED_ENROLL_USER_MESSAGES,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  LICENSE_SUBSIDY_TYPE,
  REASON_USER_MESSAGES,
} from '../constants';
import {
  mockCourseService,
  mockSubscriptionLicense,
} from '../../tests/constants';
import * as optimizelyUtils from '../../../../utils/optimizely';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import { SUBSIDY_TYPE } from '../../../../constants';
import useEnterpriseCustomer from '../../../app/data/hooks/useEnterpriseCustomer';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';
import {
  useCourseMetadata,
  useCourseRedemptionEligibility,
  useRedeemablePolicies as defaultRedeemablePolicies,
  useSubscriptions,
  useEnterpriseCustomerContainsContent,
  useEnterpriseOffers,
  useCouponCodes,
  useEnterpriseCustomer as defaultEnterpriseCustomer, useBrowseAndRequest,
} from '../../../app/data';
import useRedeemablePolices from '../../../app/data/hooks/useRedeemablePolicies';

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useRedeemablePolicies: jest.fn(),
  useCourseMetadata: jest.fn(),
  useCourseRedemptionEligibility: jest.fn(),
  useSubscriptions: jest.fn(),
  useEnterpriseCustomerContainsContent: jest.fn(),
  useEnterpriseOffers: jest.fn(),
  useCouponCodes: jest.fn(),
  useBrowseAndRequest: jest.fn(),
}));

const oldGlobalLocation = global.location;

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(),
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
  getCourseTypeConfig: jest.fn(),
  getSubscriptionDisabledEnrollmentReasonType: jest.fn(),
  getCouponCodesDisabledEnrollmentReasonType: jest.fn(),
  getMissingApplicableSubsidyReason: jest.fn(),
  useEnterpriseCustomer: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
  useParams: jest.fn(),
}
));

jest.mock('../../../app/data/hooks/useEnterpriseCustomer');
jest.mock('../../../app/data/hooks/useRedeemablePolicies');

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

const mockAuthenticatedUser = { authenticatedUser: authenticatedUserFactory() };
const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('useCourseEnrollmentUrl', () => {
  const mockCouponCode = {
    code: 'bearsRus',
    catalog: 'bears',
    couponStartDate: dayjs().subtract(1, 'w').toISOString(),
    couponEndDate: dayjs().add(8, 'w').toISOString(),
  };
  const noLicenseEnrollmentInputs = {
    enterpriseCustomer: {
      uuid: 'foo',
    },
    courseRunKey: 'bar',
    courseUuid: 'course-uuid',
    couponCodes: [mockCouponCode],
    sku: 'xkcd',
    location: { search: 'foo' },
  };
  // just skip the coupon codes here to ensure we process absence correctly
  const noCouponCodesEnrollmentInputs = {
    enterpriseCustomer: {
      uuid: 'foo',
    },
    courseRunKey: 'bar',
    courseUuid: 'course-uuid',
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

  beforeEach(() => {
    jest.clearAllMocks();
    useLocation.mockReturnValue({
      pathname: '/enterprise-slug/course/edX+DemoX',
    });
    getConfig.mockReturnValue({
      LMS_BASE_URL: process.env.LMS_BASE_URL,
      ECOMMERCE_BASE_URL: process.env.ECOMMERCE_BASE_URL,
    });
  });

  describe('subscription license', () => {
    test('returns an lms url to DSC for enrollment with a license', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl(withLicenseEnrollmentInputs));
      expect(result.current).toContain(process.env.LMS_BASE_URL);
      expect(result.current).toContain(withLicenseEnrollmentInputs.enterpriseCustomer.uuid);
      expect(result.current).toContain(withLicenseEnrollmentInputs.courseRunKey);
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
      expect(result.current).toContain(noLicenseEnrollmentInputs.courseRunKey);
    });

    test('with no coupon codes returns ecommerce url to add product to basket', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noLicenseEnrollmentInputs,
        couponCodes: [],
      }));
      expect(result.current).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(result.current).toContain(noLicenseEnrollmentInputs.sku);
      expect(result.current).toContain(noLicenseEnrollmentInputs.courseRunKey);
      expect(result.current).not.toContain('code');
    });

    test('with no coupon codes passed, treats it as empty and does not fail', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noCouponCodesEnrollmentInputs,
      }));
      expect(result.current).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(result.current).toContain(noCouponCodesEnrollmentInputs.sku);
      expect(result.current).toContain(noCouponCodesEnrollmentInputs.courseRunKey);
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

  describe('executive education-2u course type', () => {
    const mockCourseKey = 'edX+DemoX';

    beforeEach(() => {
      getConfig.mockReturnValue({
        COURSE_TYPE_CONFIG: {
          'executive-education-2u': {
            pathSlug: 'executive-education-2u',
            usesEntitlementListPrice: true,
            useAdditionalMetadata: true,
          },
        },
      });
      useLocation.mockReturnValue({
        pathname: `/enterprise-slug/executive-education-2u/course/${mockCourseKey}`,
      });
    });
    test('handles executive education-2u course type', () => {
      const mockSku = 'ABC123';
      const { result } = renderHook(() => (
        useCourseEnrollmentUrl({
          ...noLicenseEnrollmentInputs,
          isExecutiveEducation2UCourse: true,
          sku: mockSku,
        })
      ));
      expect(result.current).toContain(`/executive-education-2u/course/${mockCourseKey}/enroll`);
      expect(result.current).toContain(mockCourseKey);
    });
  });
});

describe('useUserHasSubsidyRequestForCourse', () => {
  const Wrapper = ({ children }) => (
    <AppContext.Provider value={mockAuthenticatedUser}>
      {children}
    </AppContext.Provider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    defaultEnterpriseCustomer.mockReturnValue(
      { data: mockEnterpriseCustomer },
    );
    useBrowseAndRequest.mockReturnValue({
      data: {
        configuration: undefined,
        requests: {
          subscriptionLicenses: [],
          couponCodes: [],
        },
      },
    });
  });
  it('returns false when `subsidyRequestConfiguration` are not set', () => {
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse(), { wrapper: Wrapper });
    expect(result.current).toBe(false);
  });

  it('returns false when `subsidyType` is undefined', () => {
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse(), { wrapper: Wrapper });
    expect(result.current).toBe(false);
  });

  it('returns true when `subsidyType` is LICENSE && 1 license request is found', () => {
    useBrowseAndRequest.mockReturnValue({
      data: {
        configuration: {
          subsidyRequestsEnabled: true,
          subsidyType: SUBSIDY_TYPE.LICENSE,
        },
        requests: {
          subscriptionLicenses: ['test-license'],
          couponCodes: [],
        },
      },
    });
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse(), { wrapper: Wrapper });

    expect(result.current).toBe(true);
  });

  it('returns true when `subsidyType` is COUPON && 1 coupon request is found', () => {
    useBrowseAndRequest.mockReturnValue({
      data: {
        configuration: {
          subsidyRequestsEnabled: true,
          subsidyType: SUBSIDY_TYPE.COUPON,
        },
        requests: {
          subscriptionLicenses: [],
          couponCodes: ['test-coupon'],
        },
      },
    });
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse(), { wrapper: Wrapper });

    expect(result.current).toBe(true);
  });

  it('returns false when `subsidyType` is COUPON && no matching courseId', () => {
    useBrowseAndRequest.mockReturnValue({
      data: {
        configuration: {
          subsidyRequestsEnabled: true,
          subsidyType: SUBSIDY_TYPE.COUPON,
        },
        requests: {
          subscriptionLicenses: [],
          couponCodes: [],
        },
      },
    });
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse(), { wrapper: Wrapper });

    expect(result.current).toBe(false);
  });
});

describe('useOptimizelyEnrollmentClickHandler', () => {
  const basicProps = {
    courseRunKey: 'courseRunKey',
    href: 'http://example.com',
    userEnrollments: [],
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
    const { result } = renderHook(() => useOptimizelyEnrollmentClickHandler(basicProps));

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

  const noHrefProps = {
    eventName: mockEventName,
  };

  const mockCourseState = {
    algoliaSearchParams: {
      queryId: 'algolia-query-id',
      objectId: 'algolia-object-id',
    },
  };
  const wrapper = ({ children }) => (
    <IntlProvider locale="en">
      <MemoryRouter initialEntries={['/?queryId=algolia-query-id&objectId=algolia-object-id']}>
        {children}
      </MemoryRouter>
    </IntlProvider>
  );

  beforeAll(() => {
    createGlobalLocationMock();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useCourseMetadata.mockReturnValue({ data: { activeCourseRun: { key: 'course-run-key' } } });
    useLocation.mockReturnValue({ pathname: '/', search: mockCourseState.algoliaSearchParams });
    getConfig.mockReturnValue({ ALGOLIA_INDEX_NAME: 'test-algolia-index' });
  });

  afterAll(() => {
    // restore `global.location` to the `jsdom` `Location` object
    global.location = oldGlobalLocation;
  });

  it('sends segment event and redirects', async () => {
    const { result } = renderHook(
      () => useTrackSearchConversionClickHandler(basicProps),
      { wrapper },
    );

    const outputClickHandler = result.current;
    outputClickHandler({ preventDefault: mockPreventDefault });

    expect(mockPreventDefault).toHaveBeenCalledTimes(1);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseCustomer.uuid,
      mockEventName,
      {
        products: [{ objectID: mockCourseState.algoliaSearchParams.objectId }],
        index: 'test-algolia-index',
        queryID: mockCourseState.algoliaSearchParams.queryId,
        courseKey: 'course-run-key',
      },
    );

    jest.runAllTimers();

    await waitFor(() => {
      expect(global.location.assign).toHaveBeenCalledTimes(1);
      expect(global.location.assign).toHaveBeenCalledWith(basicProps.href);
    });
  });

  it('sends segment event and redirects without href', async () => {
    const { result } = renderHook(
      () => useTrackSearchConversionClickHandler(noHrefProps),
      { wrapper },
    );

    const outputClickHandler = result.current;
    outputClickHandler({ preventDefault: mockPreventDefault });

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseCustomer.uuid,
      mockEventName,
      {
        products: [{ objectID: mockCourseState.algoliaSearchParams.objectId }],
        index: 'test-algolia-index',
        queryID: mockCourseState.algoliaSearchParams.queryId,
        courseKey: 'course-run-key',
      },
    );
  });
});

describe('useCoursePartners', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set multiple partners and label correctly', async () => {
    const course = {
      owners: [
        { name: 'Partner 1', logoImageUrl: 'https://partner1.img' },
        { name: 'Partner 2', logoImageUrl: 'https://partner2.img' },
      ],
    };
    const { result } = renderHook(() => useCoursePartners(course), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en">{children}</IntlProvider>
      ),
    });
    expect(result.current[0]).toEqual([
      { name: 'Partner 1', logoImageUrl: 'https://partner1.img' },
      { name: 'Partner 2', logoImageUrl: 'https://partner2.img' },
    ]);
    expect(result.current[1]).toEqual('Institutions');
  });

  it('should set a single partners and label correctly', async () => {
    const course = {
      owners: [
        { name: 'Partner 3', logoImageUrl: 'https://partner3.img' },
      ],
    };
    const { result } = renderHook(() => useCoursePartners(course), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en">{children}</IntlProvider>
      ),
    });
    expect(result.current[0]).toEqual([
      { name: 'Partner 3', logoImageUrl: 'https://partner3.img' },
    ]);
    expect(result.current[1]).toEqual('Institution');
  });

  it('should handle organization override based on course type config', () => {
    getCourseTypeConfig.mockReturnValueOnce({
      usesOrganizationOverride: true,
    });
    const course = {
      organizationShortCodeOverride: 'Partner 1 Override',
      organizationLogoOverrideUrl: 'https://partner1-override.img',
      owners: [
        {
          uuid: 'partner-1-uuid',
          key: 'Partner1x',
          name: 'Partner 1',
          marketingUrl: 'https://partner1.marketing',
        },
        {
          uuid: 'partner-2-uuid',
          key: 'Partner2x',
          name: 'Partner 2',
          marketingUrl: 'https://partner2.marketing',
        }],
    };
    const { result } = renderHook(() => useCoursePartners(course), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en">{children}</IntlProvider>
      ),
    });
    expect(result.current[0]).toEqual([
      {
        uuid: 'partner-1-uuid',
        name: 'Partner 1 Override',
        key: 'Partner1x',
        logoImageUrl: 'https://partner1-override.img',
        marketingUrl: 'https://partner1.marketing',
      },
    ]);
    expect(result.current[1]).toEqual('Institution');
  });
});

describe('useCourseRunWeeksToComplete', () => {
  it('should return the correct weeksToComplete and label', () => {
    const courseRun = { weeksToComplete: 4 };
    const { result } = renderHook(() => useCourseRunWeeksToComplete(courseRun), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en">{children}</IntlProvider>
      ),
    });
    expect(result.current[0]).toBe(4);
    expect(result.current[1]).toBe('weeks');
  });
  it('should handle 0 weekToComplete', () => {
    const courseRun = { weeksToComplete: 0 };
    const { result } = renderHook(() => useCourseRunWeeksToComplete(courseRun), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en">{children}</IntlProvider>
      ),
    });
    expect(result.current[0]).toBe(0);
    expect(result.current[1]).toBe('weeks');
  });
  it('should handle 1 weekToComplete', () => {
    const courseRun = { weeksToComplete: 1 };
    const { result } = renderHook(() => useCourseRunWeeksToComplete(courseRun), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en">{children}</IntlProvider>
      ),
    });
    expect(result.current[0]).toBe(1);
    expect(result.current[1]).toBe('week');
  });
  it('should handle undefined courseRun', () => {
    const { result } = renderHook(() => useCourseRunWeeksToComplete(undefined), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en">{children}</IntlProvider>
      ),
    });
    expect(result.current[0]).toBe(undefined);
    expect(result.current[1]).toBe(undefined);
  });
  it('should handle courseRun with no weeksToComplete', () => {
    const courseRun = {};
    const { result } = renderHook(() => useCourseRunWeeksToComplete(courseRun), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en">{children}</IntlProvider>
      ),
    });
    expect(result.current[0]).toBe(undefined);
    expect(result.current[1]).toBe(undefined);
  });
});

describe('useCourseTranscriptLanguages', () => {
  it('sets the correct state when the course run has transcript languages', () => {
    const courseRun = {
      transcriptLanguages: ['en', 'fr'],
    };
    const { result } = renderHook(() => useCourseTranscriptLanguages(courseRun), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en">{children}</IntlProvider>
      ),
    });

    expect(result.current[0]).toEqual(['en', 'fr']);
    expect(result.current[1]).toEqual('Video Transcripts');
  });

  it('sets the correct state when the course run has a single transcript language', () => {
    const courseRun = {
      transcriptLanguages: ['en'],
    };
    const { result } = renderHook(() => useCourseTranscriptLanguages(courseRun), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en">{children}</IntlProvider>
      ),
    });

    expect(result.current[0]).toEqual(['en']);
    expect(result.current[1]).toEqual('Video Transcript');
  });

  it('does not set state when course run is undefined', () => {
    const { result } = renderHook(() => useCourseTranscriptLanguages(undefined), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en">{children}</IntlProvider>
      ),
    });

    expect(result.current[0]).toEqual([]);
    expect(result.current[1]).toEqual(undefined);
  });

  it('does not set state when course run has no transcriptLanguages property', () => {
    const courseRun = {};
    const { result } = renderHook(() => useCourseTranscriptLanguages(courseRun), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en">{children}</IntlProvider>
      ),
    });

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
    render(
      <IntlProvider locale="en">
        <CoursePacingType courseRun={courseRun} />
      </IntlProvider>,
    );

    expect(screen.getByText('Pacing Type')).toBeTruthy();
    expect(screen.getByText('self_paced')).toBeTruthy();
    expect(screen.getByText('Self-paced on your time')).toBeTruthy();
  });

  it('should display the correct pacing type and content when passed an instructor-paced course', () => {
    const courseRun = { pacingType: 'instructor_paced' };
    render(
      <IntlProvider locale="en">
        <CoursePacingType courseRun={courseRun} />
      </IntlProvider>,
    );

    expect(screen.getByText('Pacing Type')).toBeTruthy();
    expect(screen.getByText('instructor_paced')).toBeTruthy();
    expect(screen.getByText('Instructor-led on a course schedule')).toBeTruthy();
  });
});

describe('useCoursePriceForUserSubsidy', () => {
  it('should return the correct course price when a user subsidy is applicable with percentage discount', () => {
    const listPrice = 100;
    const userSubsidyApplicableToCourse = {
      discountType: 'percentage',
      discountValue: 10,
      expirationDate: '2025-12-31',
      startDate: '2020-01-01',
      subsidyId: '123',
    };
    const { result } = renderHook(() => useCoursePriceForUserSubsidy({
      listPrice,
      userSubsidyApplicableToCourse,
    }));
    const { coursePrice } = result.current;
    expect(coursePrice).toEqual({ list: 100, discounted: 90 });
  });

  it('should return the correct course price when a user subsidy is applicable with unknown discount type', () => {
    const listPrice = 100;
    const userSubsidyApplicableToCourse = {
      discountType: 'unknown',
      discountValue: 100,
      expirationDate: '2025-12-31',
      startDate: '2020-01-01',
      subsidyId: '123',
    };
    const { result } = renderHook(() => useCoursePriceForUserSubsidy({
      listPrice,
      userSubsidyApplicableToCourse,
    }));
    const { coursePrice } = result.current;
    expect(coursePrice).toEqual({ list: 100, discounted: 100 });
  });

  it('should return the correct course price when a user subsidy is applicable with absolute discount', () => {
    const listPrice = 150;
    const userSubsidyApplicableToCourse = {
      discountType: 'absolute',
      discountValue: 10,
      expirationDate: '2025-12-31',
      startDate: '2020-01-01',
      subsidyId: '123',
    };
    const { result } = renderHook(() => useCoursePriceForUserSubsidy({
      listPrice,
      userSubsidyApplicableToCourse,
    }));
    const { coursePrice } = result.current;
    expect(coursePrice).toEqual({ list: 150, discounted: 140 });
  });

  it('should return the correct course price when a user subsidy is not applicable', () => {
    const listPrice = 100;
    const userSubsidyApplicableToCourse = null;
    const { result } = renderHook(() => useCoursePriceForUserSubsidy({
      listPrice,
      userSubsidyApplicableToCourse,
    }));
    const { coursePrice } = result.current;
    expect(coursePrice).toEqual({ list: 100 });
  });

  it('should return the correct course price for exec ed course', () => {
    const listPrice = 200;

    const userSubsidyApplicableToCourse = null;
    const { result } = renderHook(() => useCoursePriceForUserSubsidy({
      listPrice,
      userSubsidyApplicableToCourse,
    }));
    const { coursePrice } = result.current;
    expect(coursePrice).toEqual({ list: 200 });
  });

  it('should return the correct currency', () => {
    const listPrice = 100;
    const userSubsidyApplicableToCourse = null;
    const { result } = renderHook(() => useCoursePriceForUserSubsidy({
      listPrice,
      userSubsidyApplicableToCourse,
    }));
    const { currency } = result.current;
    expect(currency).toEqual('USD');
  });

  it('should return null if no list price is specified', () => {
    const userSubsidyApplicableToCourse = null;
    const { result } = renderHook(() => useCoursePriceForUserSubsidy({
      userSubsidyApplicableToCourse,
    }));
    const { coursePrice } = result.current;
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

  beforeEach(() => {
    useLocation.mockReturnValue({
      pathname: '/',
      search: '?queryId=123&objectId=abc',
    });
  });

  it('should display the queryId and objectId from the URL search params', () => {
    render(
      <MemoryRouter initialEntries={['/?queryId=123&objectId=abc']}>
        <TestComponent />
      </MemoryRouter>,
    );
    expect(screen.getByText('Query ID: 123')).toBeTruthy();
    expect(screen.getByText('Object ID: abc')).toBeTruthy();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true, search: '' });
  });
});

describe('useUserSubsidyApplicableToCourse', () => {
  const mockCatalogUUID = 'test-enterprise-catalog-uuid';
  const baseArgs = {
    isLoadingAny: true,
    isPolicyRedemptionEnabled: false,
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
    enterpriseAdminUsers: [],
    customerAgreementConfig: undefined,
    contactEmail: undefined,
  };
  const missingUserSubsidyReason = {
    reason: DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED,
    userMessage: REASON_USER_MESSAGES.LEARNER_LIMITS_REACHED,
    metadata: { enterpriseAdministrators: ['edx@example.com'] },
  };
  const expectedTransformedMissingUserSubsidyReason = {
    reason: DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED,
    userMessage: REASON_USER_MESSAGES.LEARNER_LIMITS_REACHED,
    actions: expect.any(Object),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ courseKey: 'edX+DemoX' });
    defaultEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useCourseMetadata.mockReturnValue({});
    useRedeemablePolices.mockReturnValue({
      data: {
        redeemablePolicies: [],
      },
    });
    useCourseRedemptionEligibility.mockReturnValue({ data: {} });
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: undefined,
        subscriptionLicense: undefined,
        subscriptionPlan: undefined,
        shouldShowActivationSuccessMessage: false,
      },
    });
    useEnterpriseCustomerContainsContent.mockReturnValue({
      data: {
        containsContentItems: false,
        catalogList: [],
      },
    });
    useEnterpriseOffers.mockReturnValue({
      data: {
        enterpriseOffers: [],
        canEnrollWithEnterpriseOffers: false,
      },
    });
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [],
      },
    });
  });

  it('handles null course data', () => {
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());
    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: undefined,
    });
  });

  it('handles course data with redeemable subsidy access policy', () => {
    getSubsidyToApplyForCourse.mockReturnValueOnce({
      subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
    });
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
      }),
      missingUserSubsidyReason: undefined,
    });
  });

  it('does not have redeemable subsidy access policy and catalog(s) does not contain course', () => {
    getMissingApplicableSubsidyReason.mockReturnValueOnce({
      reason: DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG,
      userMessage: DISABLED_ENROLL_USER_MESSAGES[DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG],
      actions: null,
    });

    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: {
        reason: DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG,
        userMessage: DISABLED_ENROLL_USER_MESSAGES[DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG],
        actions: null,
      },
    });
  });

  // TODO Fix test, shows 'No matching tests found'
  it.each(
    [
      { enterpriseAdminUsers: [] },
      { enterpriseAdminUsers: ['edx@example.com'] },
    ],
  )('does not have redeemable subsidy access policy and catalog(s) contains course', ({ enterpriseAdminUsers }) => {
    getMissingApplicableSubsidyReason.mockReturnValueOnce({
      reason: enterpriseAdminUsers.length > 0
        ? DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY
        : DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS,
      userMessage: enterpriseAdminUsers.length > 0
        ? DISABLED_ENROLL_USER_MESSAGES[DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY]
        : DISABLED_ENROLL_USER_MESSAGES[DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS],
      actions: null,
    });
    defaultEnterpriseCustomer.mockReturnValue({
      data: {
        ...mockEnterpriseCustomer,
        enterpriseAdminUsers,
      },
    });
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    let expectedReasonType = DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS;
    let expectedAction = null;

    if (enterpriseAdminUsers.length > 0) {
      expectedReasonType = DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY;
      expectedAction = expect.any(Object);
    }

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: {
        reason: expectedReasonType,
        userMessage: DISABLED_ENROLL_USER_MESSAGES[expectedReasonType],
        actions: expectedAction,
      },
    });
  });

  it('does not have redeemable subsidy access policy and has missing subsidy access policy user message', () => {
    getMissingApplicableSubsidyReason.mockReturnValueOnce({
      reason: missingUserSubsidyReason.reason,
      userMessage: missingUserSubsidyReason.userMessage,
      actions: null,
    });

    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: expectedTransformedMissingUserSubsidyReason,
    });
  });

  it('finds applicable subscription license', () => {
    getSubsidyToApplyForCourse.mockReturnValueOnce({
      subsidyType: LICENSE_SUBSIDY_TYPE,
    });

    useSubscriptions.mockReturnValueOnce({
      data: {
        subscriptionLicense: {
          ...mockSubscriptionLicense,
          status: LICENSE_STATUS.ACTIVATED,
          discountType: 'percentage',
          discountValue: 100,
        },
        subscriptionPlan: {
          enterpriseCatalogUuid: 'test-catalog-uuid',
        },
      },
    });

    useEnterpriseCustomerContainsContent.mockReturnValueOnce({
      data: {
        catalogList: ['test-catalog-uuid'],
        containsContentItems: true,
      },
    });
    useCourseRedemptionEligibility.mockReturnValue({
      data: {
        isPolicyRedemptionEnabled: false,
        redeemableSubsidyAccessPolicy: undefined,
      },
    });
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(getSubsidyToApplyForCourse).toHaveBeenCalledWith({
      applicableSubscriptionLicense: {
        ...mockSubscriptionLicense,
        status: LICENSE_STATUS.ACTIVATED,
        discountType: 'percentage',
        discountValue: 100,
      },
      applicableCouponCode: undefined,
      applicableEnterpriseOffer: undefined,
      applicableSubsidyAccessPolicy: {
        isPolicyRedemptionEnabled: false,
        redeemableSubsidyAccessPolicy: undefined,
      },
    });

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: LICENSE_SUBSIDY_TYPE,
      }),
      missingUserSubsidyReason: undefined,
    });
  });

  it('handles disabled enrollment reason related to subscriptions', () => {
    getMissingApplicableSubsidyReason.mockReturnValueOnce({
      reason: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED_NO_ADMINS,
      userMessage: DISABLED_ENROLL_USER_MESSAGES[DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED_NO_ADMINS],
      actions: {},
    });

    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: {
        reason: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED_NO_ADMINS,
        userMessage: REASON_USER_MESSAGES.SUBSCRIPTION_EXPIRED_NO_ADMINS,
        actions: expect.any(Object),
      },
    });
  });

  it('handles disabled enrollment reason related to coupon codes', () => {
    getMissingApplicableSubsidyReason.mockReturnValueOnce({
      reason: DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED,
      userMessage: REASON_USER_MESSAGES.COUPON_CODE_NOT_ASSIGNED,
      actions: {},
    });
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: {
        reason: DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED,
        userMessage: REASON_USER_MESSAGES.COUPON_CODE_NOT_ASSIGNED,
        actions: expect.any(Object),
      },
    });
  });

  it('finds applicable coupon code', () => {
    getSubscriptionDisabledEnrollmentReasonType.mockReturnValueOnce(undefined);
    const mockCouponCode = {
      catalog: mockCatalogUUID,
      code: 'test-coupon-code',
      usageType: 'percentage',
      benefitValue: 100,
      couponStartDate: dayjs().format('YYYY-MM-DD'),
      couponEndDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
    };
    getSubsidyToApplyForCourse.mockReturnValueOnce({
      subsidyType: COUPON_CODE_SUBSIDY_TYPE,
    });
    findCouponCodeForCourse.mockReturnValueOnce(mockCouponCode);
    useCouponCodes.mockReturnValueOnce({ data: { couponCodeAssignments: [mockCouponCode] } });
    useEnterpriseCustomerContainsContent.mockReturnValueOnce({ data: { catalogList: [mockCatalogUUID] } });
    useCourseRedemptionEligibility.mockReturnValue({
      data: {
        isPolicyRedemptionEnabled: false,
      },
    });
    const args = {
      ...baseArgs,
      couponCodes: [mockCouponCode],
    };
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(findCouponCodeForCourse).toHaveBeenCalledWith(args.couponCodes, args.courseData.catalog.catalogList);
    expect(getSubsidyToApplyForCourse).toHaveBeenCalledWith({
      applicableCouponCode: mockCouponCode,
      applicableEnterpriseOffer: undefined,
      applicableSubscriptionLicense: null,
      applicableSubsidyAccessPolicy: {
        isPolicyRedemptionEnabled: false,
        redeemableSubsidyAccessPolicy: undefined,
      },
    });

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: COUPON_CODE_SUBSIDY_TYPE,
      }),
      missingUserSubsidyReason: undefined,
    });
  });

  it('finds applicable enterprise offer', () => {
    mockCourseService.fetchUserLicenseSubsidy.mockReturnValueOnce(undefined);
    getSubscriptionDisabledEnrollmentReasonType.mockReturnValueOnce(undefined);
    const mockEnterpriseOffer = {
      catalog: mockCatalogUUID,
      code: 'test-coupon-code',
      usageType: 'percentage',
      benefitValue: 100,
      couponStartDate: dayjs().format('YYYY-MM-DD'),
      couponEndDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
    };
    getSubsidyToApplyForCourse.mockReturnValueOnce({
      subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
    });
    findEnterpriseOfferForCourse.mockReturnValueOnce(mockEnterpriseOffer);

    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
      }),
      missingUserSubsidyReason: undefined,
    });
  });
  it('returns offer error', () => {
    getMissingApplicableSubsidyReason.mockReturnValueOnce({
      reason: DISABLED_ENROLL_REASON_TYPES.ENTERPRISE_OFFER_EXPIRED,
      userMessage: REASON_USER_MESSAGES.ENTERPRISE_OFFER_EXPIRED,
      actions: null,
    });
    findCouponCodeForCourse.mockReturnValueOnce(undefined);

    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: {
        reason: DISABLED_ENROLL_REASON_TYPES.ENTERPRISE_OFFER_EXPIRED,
        userMessage: DISABLED_ENROLL_USER_MESSAGES[DISABLED_ENROLL_REASON_TYPES.ENTERPRISE_OFFER_EXPIRED],
        actions: null,
      },
    });
  });
});

describe('useMinimalCourseMetadata', () => {
  const mockOrgName = 'Fake Org Name';
  const mockLogoImageUrl = 'https://fake-logo.url';
  const mockOrgMarketingUrl = 'https://fake-mktg.url';
  const mockWeeksToComplete = 8;
  const mockListPrice = 100;
  const mockCurrency = 'USD';
  const mockCourseTitle = 'Test Course Title';
  const mockCourseRunStartDate = '2023-04-20T12:00:00Z';

  const baseCourseMetadataValue = {
    organization: {
      name: mockOrgName,
      logoImgUrl: mockLogoImageUrl,
      marketingUrl: mockOrgMarketingUrl,
    },
    title: mockCourseTitle,
    startDate: mockCourseRunStartDate,
    duration: `${mockWeeksToComplete} Weeks`,
    priceDetails: {
      price: mockListPrice,
      currency: mockCurrency,
    },
  };

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <AppContext.Provider value={mockAuthenticatedUser}>
        {children}
      </AppContext.Provider>
    </BrowserRouter>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useCourseMetadata.mockReturnValue(baseCourseMetadataValue);
    useParams.mockReturnValue({ courseKey: 'test-course-key' });
    useRedeemablePolices.mockReturnValue({
      data: {
        redeemablePolicies: [],
      },
    });
    useCourseRedemptionEligibility.mockReturnValue({ data: {} });
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: undefined,
        subscriptionLicense: undefined,
        subscriptionPlan: undefined,
        shouldShowActivationSuccessMessage: false,
      },
    });
    useEnterpriseCustomerContainsContent.mockReturnValue({
      data: {
        containsContentItems: false,
        catalogList: [],
      },
    });
    useEnterpriseOffers.mockReturnValue({
      data: {
        enterpriseOffers: [],
        canEnrollWithEnterpriseOffers: false,
      },
    });
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [],
      },
    });
  });

  it('should return the correct base course metadata', () => {
    const { result } = renderHook(() => useMinimalCourseMetadata(), { wrapper: Wrapper });
    expect(result.current).toEqual(baseCourseMetadataValue);
  });

  it('should handle empty activeCourseRun', () => {
    const updatedCourseMetadataValue = {
      ...baseCourseMetadataValue,
      duration: '-',
      startDate: undefined,
    };
    useCourseMetadata.mockReturnValue(updatedCourseMetadataValue);
    const { result } = renderHook(
      () => useMinimalCourseMetadata(),
      { wrapper: Wrapper },
    );
    expect(result.current).toEqual(
      {
        organization: {
          name: mockOrgName,
          logoImgUrl: mockLogoImageUrl,
          marketingUrl: mockOrgMarketingUrl,
        },
        title: mockCourseTitle,
        startDate: undefined,
        duration: '-',
        priceDetails: {
          price: mockListPrice,
          currency: mockCurrency,
        },
      },
    );
  });

  it('should handle when weeksToComplete is only 1', () => {
    const updatedCourseMetadataValue = {
      ...baseCourseMetadataValue,
      duration: '1 Week',
    };
    useCourseMetadata.mockReturnValue(updatedCourseMetadataValue);
    const { result } = renderHook(
      () => useMinimalCourseMetadata(),
      { wrapper: Wrapper },
    );
    expect(result.current).toEqual(
      {
        organization: {
          name: mockOrgName,
          logoImgUrl: mockLogoImageUrl,
          marketingUrl: mockOrgMarketingUrl,
        },
        title: mockCourseTitle,
        startDate: mockCourseRunStartDate,
        duration: '1 Week',
        priceDetails: {
          price: mockListPrice,
          currency: mockCurrency,
        },
      },
    );
  });

  it('should handle organization short code and logo overrides', () => {
    const mockOrgShortCode = 'Test Shortcode Override';
    const mockOrgLogoUrl = 'https://fake-logo-override.url';
    const updatedCourseMetadataValue = {
      ...baseCourseMetadataValue,
      organization: {
        name: mockOrgShortCode,
        logoImgUrl: mockOrgLogoUrl,
        marketingUrl: mockOrgMarketingUrl,
      },
    };
    useCourseMetadata.mockReturnValue(updatedCourseMetadataValue);
    const { result } = renderHook(
      () => useMinimalCourseMetadata(),
      { wrapper: Wrapper },
    );
    expect(result.current).toEqual(
      {
        organization: {
          name: mockOrgShortCode,
          logoImgUrl: mockOrgLogoUrl,
          marketingUrl: mockOrgMarketingUrl,
        },
        title: mockCourseTitle,
        startDate: mockCourseRunStartDate,
        duration: '8 Weeks',
        priceDetails: {
          price: mockListPrice,
          currency: mockCurrency,
        },
      },
    );
  });
});

describe('useIsCourseAssigned', () => {
  const mockContentKey = 'edX+DemoX';
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useCourseMetadata.mockReturnValue({ data: { key: 'test-key' } });
  });
  const Wrapper = ({ children }) => (
    <AppContext.Provider value={mockAuthenticatedUser}>
      {children}
    </AppContext.Provider>
  );
  it('should return false if there are no allocated assignments', () => {
    const learnerContentAssignments = {
      hasAllocatedAssignments: false,
    };
    defaultRedeemablePolicies.mockReturnValue({ data: { learnerContentAssignments } });
    const { result } = renderHook(() => useIsCourseAssigned(), { wrapper: Wrapper });

    expect(result.current).toEqual(false);
  });

  it('should return false if there is NO matching allocated assignment to the course key', () => {
    const learnerContentAssignments = {
      hasAllocatedAssignments: true,
      allocatedAssignments: [
        {
          contentKey: mockContentKey,
          state: 'allocated',
        },
      ],
    };
    defaultRedeemablePolicies.mockReturnValue({ data: { learnerContentAssignments } });
    useCourseMetadata.mockReturnValue({ data: { key: 'non-existent-course-key' } });

    const { result } = renderHook(
      () => useIsCourseAssigned(),
      { wrapper: Wrapper },
    );

    expect(result.current).toEqual(false);
  });

  it('should return false if matching assignment(s) are canceled', () => {
    const learnerContentAssignments = {
      hasAllocatedAssignments: false,
      allocatedAssignments: [],
      hasCanceledAssignments: true,
      canceledAssignments: [
        {
          contentKey: mockContentKey,
          state: 'cancelled',
        },
      ],
    };
    defaultRedeemablePolicies.mockReturnValue({ data: { learnerContentAssignments } });
    useCourseMetadata.mockReturnValue({ data: { key: mockContentKey } });

    const { result } = renderHook(
      () => useIsCourseAssigned(),
      { wrapper: Wrapper },
    );

    expect(result.current).toEqual(false);
  });

  it('should return true if there is a matching allocated assignment to the course key', () => {
    const learnerContentAssignments = {
      hasAllocatedAssignments: true,
      allocatedAssignments: [
        {
          contentKey: mockContentKey,
          state: 'allocated',
        },
      ],
    };
    defaultRedeemablePolicies.mockReturnValue({ data: { learnerContentAssignments } });
    useCourseMetadata.mockReturnValue({ data: { key: mockContentKey } });

    const { result } = renderHook(
      () => useIsCourseAssigned(),
      { wrapper: Wrapper },
    );
    expect(result.current).toEqual(true);
  });
});
