import { COURSE_STATUSES } from '../constants';
import { transformCourseEnrollment, groupCourseEnrollmentsByStatus } from '../utils';
import { createRawCourseEnrollment } from '../../tests/enrollment-testutils';

describe('transformCourseEnrollment', () => {
  it('should transform a course enrollment', () => {
    const originalCourseEnrollment = createRawCourseEnrollment();

    const transformedCourseEnrollment = {
      completed: originalCourseEnrollment.completed,
      courseRunId: originalCourseEnrollment.courseRunId,
      courseRunStatus: originalCourseEnrollment.courseRunStatus,
      title: originalCourseEnrollment.displayName,
      microMastersTitle: originalCourseEnrollment.micromastersTitle,
      linkToCourse: originalCourseEnrollment.resumeCourseRunUrl,
      linkToCertificate: originalCourseEnrollment.certificateDownloadUrl,
      hasEmailsEnabled: originalCourseEnrollment.emailsEnabled,
      isRevoked: originalCourseEnrollment.isRevoked,
      notifications: originalCourseEnrollment.dueDates,
    };

    expect(transformCourseEnrollment(originalCourseEnrollment)).toEqual(transformedCourseEnrollment);
  });
});

describe('groupCourseEnrollmentsByStatus', () => {
  const inProgressCourseEnrollment = { courseRunStatus: COURSE_STATUSES.inProgress };
  const upcomingCourseEnrollment = { courseRunStatus: COURSE_STATUSES.upcoming };
  const completedCourseEnrollment = { courseRunStatus: COURSE_STATUSES.completed };
  const savedForLaterCourseEnrollment = { courseRunStatus: COURSE_STATUSES.savedForLater };
  it('should group course enrollments by their status', () => {
    const courseEnrollmentsByStatus = groupCourseEnrollmentsByStatus(
      [savedForLaterCourseEnrollment, completedCourseEnrollment, upcomingCourseEnrollment, inProgressCourseEnrollment],
    );

    expect(courseEnrollmentsByStatus).toEqual(
      {
        inProgress: [inProgressCourseEnrollment],
        upcoming: [upcomingCourseEnrollment],
        completed: [completedCourseEnrollment],
        savedForLater: [savedForLaterCourseEnrollment],
        requested: [],
      },
    );
  });
});
