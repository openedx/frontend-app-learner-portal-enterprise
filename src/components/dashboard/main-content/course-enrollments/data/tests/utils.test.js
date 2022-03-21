import { COURSE_STATUSES } from '../constants';
import { transformCourseEnrollment, groupCourseEnrollmentsByStatus, transformSubsidyRequest } from '../utils';
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

describe('transformSubsidyRequest', () => {
  it('should transform a subsidy request', () => {
    const slug = 'sluggy';
    const subsidyRequest = {
      uuid: 'uuid',
      lms_user_id: 1,
      email: 'edx@example.com',
      course_id: 'edx+101',
      course_title: 'edX 101',
      enterprise_customer_uuid: 'enterprise-uuid',
      state: 'requested',
      reviewed_at: null,
      reviewer_lms_user_id: null,
      decline_reason: null,
      created: '2016-03-03T18:55:59.671129Z',
      modified: '2022-03-20T15:59:40.375739Z',
      coupon_id: null,
      coupon_code: null,
    };

    const transformedSubsidyRequest = {
      courseRunId: subsidyRequest.courseId,
      title: subsidyRequest.courseTitle,
      courseRunStatus: COURSE_STATUSES.requested,
      linkToCourse: `${slug}/course/${subsidyRequest.courseId}`,
      created: subsidyRequest.created,
    };

    expect(transformSubsidyRequest({ subsidyRequest, slug })).toEqual(transformedSubsidyRequest);
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
