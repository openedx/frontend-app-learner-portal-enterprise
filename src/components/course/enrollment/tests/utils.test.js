import { COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE, LICENSE_SUBSIDY_TYPE } from '../../data/constants';
import { enrollButtonTypes } from '../constants';

import { determineEnrollmentType, canUserRequestSubsidyForCourse, getExternalCourseEnrollmentUrl } from '../utils';

const {
  TO_COURSEWARE_PAGE,
  VIEW_ON_DASHBOARD,
  ENROLL_DISABLED,
  TO_DATASHARING_CONSENT,
  TO_ECOM_BASKET,
  HIDE_BUTTON,
} = enrollButtonTypes;

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: () => ({
    COURSE_TYPE_CONFIG: {
      'executive-education-2u': {
        pathSlug: 'executive-education-2u',
      },
    },
  }),
}));

describe('determineEnrollmentType', () => {
  const baseArgs = {
    isUserEnrolled: false,
    isEnrollable: true,
    isCourseStarted: true,
    subsidyData: { userSubsidyApplicableToCourse: null },
    userHasSubsidyRequestForCourse: false,
  };

  test('resolves user-enrolled, course-started to "to courseware page" type', () => {
    const args = {
      ...baseArgs,
      isUserEnrolled: true,
    };
    expect(determineEnrollmentType(args)).toBe(TO_COURSEWARE_PAGE);
  });

  test('resolves user-enrolled case to "view on dashboard" page type', () => {
    const args = {
      ...baseArgs,
      isUserEnrolled: true,
      isCourseStarted: false,
    };
    expect(determineEnrollmentType(args)).toBe(VIEW_ON_DASHBOARD);
  });

  test('resolves unenrollable case to disabled enroll button', () => {
    const args = {
      ...baseArgs,
      isEnrollable: false,
      subsidyData: {
        ...baseArgs.subsidyData,
        userSubsidyApplicableToCourse: { subsidyType: LICENSE_SUBSIDY_TYPE },
      },
    };
    expect(determineEnrollmentType(args)).toBe(ENROLL_DISABLED);
  });

  test('no subsidy, show disabled enroll button', () => {
    expect(determineEnrollmentType(baseArgs)).toBe(ENROLL_DISABLED);
  });

  test('license subsidy, show data sharing consent button', () => {
    const args = {
      ...baseArgs,
      subsidyData: {
        ...baseArgs.subsidyData,
        userSubsidyApplicableToCourse: { subsidyType: LICENSE_SUBSIDY_TYPE },
      },
    };
    expect(determineEnrollmentType(args)).toBe(TO_DATASHARING_CONSENT);
  });

  test.each([
    { subsidyType: COUPON_CODE_SUBSIDY_TYPE },
    { subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE },
  ])('ecommerce-based subsidy available (%s), show ecom basket button', ({ subsidyType }) => {
    const args = {
      ...baseArgs,
      subsidyData: {
        ...baseArgs.subsidyData,
        userSubsidyApplicableToCourse: { subsidyType },
      },
    };
    expect(determineEnrollmentType(args)).toBe(TO_ECOM_BASKET);
  });

  test('user has subsidy request for course, hide enroll button', () => {
    const args = {
      ...baseArgs,
      subsidyData: {
        ...baseArgs.subsidyData,
        subsidyRequestConfiguration: { subsidyRequestsEnabled: true },
      },
      userCanRequestSubsidyForCourse: true,
    };
    expect(determineEnrollmentType(args)).toBe(HIDE_BUTTON);
  });

  test.each([
    { hasSubsidyData: true },
    { hasSubsidyData: false },
  ])('falls back to a disabled enroll button (%s)', ({ hasSubsidyData }) => {
    const args = {
      ...baseArgs,
      subsidyData: hasSubsidyData ? {
        ...baseArgs.subsidyData,
        userSubsidyApplicableToCourse: { subsidyType: 'unknown' },
      } : undefined,
    };
    expect(determineEnrollmentType(args)).toBe(ENROLL_DISABLED);
  });
});

describe('canUserRequestSubsidyForCourse', () => {
  const disabledSubsidyRequests = { subsidyRequestsEnabled: false };
  const enabledSubsidyRequests = { subsidyRequestsEnabled: true };

  test.each([
    {
      subsidyRequestConfiguration: undefined,
      subsidyRequestCatalogsApplicableToCourse: undefined,
      userSubsidyApplicableToCourse: undefined,
      expected: false,
    },
    {
      subsidyRequestConfiguration: enabledSubsidyRequests,
      subsidyRequestCatalogsApplicableToCourse: undefined,
      userSubsidyApplicableToCourse: undefined,
      expected: false,
    },
    {
      subsidyRequestConfiguration: disabledSubsidyRequests,
      subsidyRequestCatalogsApplicableToCourse: new Set(['catalog-uuid']),
      userSubsidyApplicableToCourse: { subsidyType: LICENSE_SUBSIDY_TYPE },
      expected: false,
    },
    {
      subsidyRequestConfiguration: enabledSubsidyRequests,
      subsidyRequestCatalogsApplicableToCourse: new Set(['catalog-uuid']),
      userSubsidyApplicableToCourse: { subsidyType: LICENSE_SUBSIDY_TYPE },
      expected: false,
    },
    {
      subsidyRequestConfiguration: enabledSubsidyRequests,
      subsidyRequestCatalogsApplicableToCourse: new Set(['catalog-uuid']),
      userSubsidyApplicableToCourse: undefined,
      expected: true,
    },
  ])('returns expected value with the provided inputs (%s)', ({
    subsidyRequestConfiguration,
    subsidyRequestCatalogsApplicableToCourse,
    userSubsidyApplicableToCourse,
    expected,
  }) => {
    const args = {
      subsidyRequestConfiguration,
      subsidyRequestCatalogsApplicableToCourse,
      userSubsidyApplicableToCourse,
    };
    expect(canUserRequestSubsidyForCourse(args)).toEqual(expected);
  });
});

describe('getExternalCourseEnrollmentUrl', () => {
  const testRouteUrl = 'https://www.test.com/executive-education-2u/path';

  test('resolves to enrollment page if not already enrolled', () => {
    const args = {
      currentRouteUrl: testRouteUrl,
      isUserEnrolled: false,
    };
    expect(getExternalCourseEnrollmentUrl(args)).toEqual('https://www.test.com/executive-education-2u/path/enroll');
  });

  test('resolves to enrolled page if already enrolled', () => {
    const args = {
      currentRouteUrl: testRouteUrl,
      isUserEnrolled: true,
    };
    expect(getExternalCourseEnrollmentUrl(args)).toEqual('https://www.test.com/executive-education-2u/path/enroll/complete');
  });

  test('resolves to undefined if not an external course enrollment url', () => {
    const args = {
      currentRouteUrl: 'https://www.test.com/path',
      isUserEnrolled: false,
    };
    expect(getExternalCourseEnrollmentUrl(args)).toBeUndefined();
  });
});
