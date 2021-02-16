import { enrollButtonTypes } from '../constants';

import { determineEnrollmentType } from '../utils';

const {
  TO_COURSEWARE_PAGE, VIEW_ON_DASHBOARD, ENROLL_DISABLED, TO_DATASHARING_CONSENT,
  TO_ECOM_BASKET, TO_VOUCHER_REDEEM,
} = enrollButtonTypes;
describe('determineEnrollmentType correctly resolves enrollment type', () => {
  test('resolves user-enrolled, course-started to "to courseware page" type', () => {
    expect(determineEnrollmentType({
      isUserEnrolled: true,
      isCourseStarted: true,
    })).toBe(TO_COURSEWARE_PAGE);
  });
  test('resolves user-enrolled case to "view on dashboard" page type', () => {
    expect(determineEnrollmentType({
      isUserEnrolled: true,
      isCourseStarted: false,
    })).toBe(VIEW_ON_DASHBOARD);
  });
  test('resolves unenrollable case to disabled enroll button', () => {
    expect(determineEnrollmentType({
      isUserEnrolled: false,
      isEnrollable: false,
    })).toBe(ENROLL_DISABLED);
  });
  test('resolves valid subscription, valid subsidy to datasharing consent page', () => {
    expect(determineEnrollmentType({
      isUserEnrolled: false,
      isEnrollable: true,
      subsidyData: {
        subscriptionLicense: { uuid: 'test' },
        userSubsidyApplicableToCourse: {
          subsidyType: 'license',
        },
        enrollmentUrl: 'http://test',
      },
    })).toBe(TO_DATASHARING_CONSENT);
  });
  test('resolves valid subscription, no subsidy, to ecom basket page', () => {
    expect(determineEnrollmentType({
      isUserEnrolled: false,
      isEnrollable: true,
      subsidyData: {
        subscriptionLicense: { uuid: 'test' },
        userSubsidyApplicableToCourse: null,
        enrollmentUrl: 'http://test',
      },
    })).toBe(TO_ECOM_BASKET);
  });
  test('resolves invalid subscription, offer not available, to ecom basket page', () => {
    expect(determineEnrollmentType({
      isUserEnrolled: false,
      isEnrollable: true,
      subsidyData: {
        subscriptionLicense: null,
        userSubsidyApplicableToCourse: null,
        enrollmentUrl: 'http://test',
      },
    })).toBe(TO_ECOM_BASKET);
  });
  test('resolves invalid subscription, offer available, to voucher redeem page', () => {
    expect(determineEnrollmentType({
      isUserEnrolled: false,
      isEnrollable: true,
      subsidyData: {
        subscriptionLicense: null,
        userSubsidyApplicableToCourse: null,
        enrollmentUrl: 'http://test',
        courseHasOffer: true,
      },
    })).toBe(TO_VOUCHER_REDEEM);
  });
});
