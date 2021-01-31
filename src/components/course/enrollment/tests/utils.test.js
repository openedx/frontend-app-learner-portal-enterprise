import { enrollButtonTypes } from '../constants';

import { determineEnrollmentType } from '../utils';

const { TO_COURSEWARE_PAGE, VIEW_ON_DASHBOARD, ENROLL_DISABLED, TO_DATASHARING_CONSENT } = enrollButtonTypes;
describe('determineEnrollmentType correctly resolves enrollment type', () => {
  test('resolves courseware page type', () => {
    expect(determineEnrollmentType({
      isUserEnrolled: true,
      isCourseStarted: true,
    })).toBe(TO_COURSEWARE_PAGE);
  });
  test('resolves view on dashboard page type', () => {
    expect(determineEnrollmentType({
      isUserEnrolled: true,
      isCourseStarted: false,
    })).toBe(VIEW_ON_DASHBOARD);
  });
  test('resolves view on dashboard page type', () => {
    expect(determineEnrollmentType({
      isUserEnrolled: false,
      isEnrollable: false,
    })).toBe(ENROLL_DISABLED);
  });
  test('resolves view on datasharing consent page type', () => {
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
});
