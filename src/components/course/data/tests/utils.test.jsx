/**
 * Tests for util logic
 */

import { typeOfEnrollButton } from '../utils';
import { enrollButtonTypes } from '../constants';

const {
  TO_COURSE_PAGE, TO_DASHBOARD, ENROLL_DISABLED, ENROLL_ENABLED,
} = enrollButtonTypes;

describe('tests for enroll button logic flow', () => {
  test('type of button is resolved correctly', () => {
    expect(typeOfEnrollButton({
      isUserEnrolled: true,
      isCourseStarted: true,
    })).toBe(TO_COURSE_PAGE);

    expect(typeOfEnrollButton({
      isUserEnrolled: true,
      isCourseStarted: false,
    })).toBe(TO_DASHBOARD);

    expect(typeOfEnrollButton({
      isUserEnrolled: false,
      isEnrollable: false,
    })).toBe(ENROLL_DISABLED);

    expect(typeOfEnrollButton({
      isUserEnrolled: false,
      isEnrollable: true,
    })).toBe(ENROLL_ENABLED);
  });
});
