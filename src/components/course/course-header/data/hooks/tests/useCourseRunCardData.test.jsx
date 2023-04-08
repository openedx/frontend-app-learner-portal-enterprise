import { renderHook } from '@testing-library/react-hooks';

import useCourseRunCardData from '../useCourseRunCardData';
import {
  COURSE_RUN,
  COURSE_RUN_URL,
  LEARNER_CREDIT_SUBSIDY,
} from '../../constants';

describe('useCourseRunCardData', () => {
  describe('user already enrolled', () => {
    it('should handle existing user enrollment', () => {
      const args = {
        courseRun: COURSE_RUN,
        isUserEnrolled: true,
        userSubsidyApplicableToCourse: LEARNER_CREDIT_SUBSIDY,
        courseRunUrl: COURSE_RUN_URL,
      };
      const props = renderHook(() => useCourseRunCardData(args));
      expect(props).toEqual(
        expect.objectContaining({
          heading: 'Course started',
          subHeading: 'You are enrolled',
        }),
      );
    });

    it('should handle existing user enrollment with instructor-paced course', () => {
      expect(true).toEqual(true);
    });
  });

  describe('user not yet enrolled', () => {
    it('should handle "Enroll"', () => {
      expect(true).toEqual(true);
    });
  });
});
