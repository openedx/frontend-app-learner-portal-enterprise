import { COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE, LICENSE_SUBSIDY_TYPE } from '../../data/constants';
import { enrollButtonTypes } from '../constants';

import { determineEnrollmentType } from '../utils';

const {
  TO_COURSEWARE_PAGE,
  VIEW_ON_DASHBOARD,
  ENROLL_DISABLED,
  TO_DATASHARING_CONSENT,
  TO_ECOM_BASKET,
} = enrollButtonTypes;

const baseArgs = {
  isUserEnrolled: false,
  isEnrollable: true,
  isCourseStarted: true,
  subsidyData: {
    userSubsidyApplicableToCourse: null,
  },
};

describe('determineEnrollmentType correctly resolves enrollment type', () => {
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
});
