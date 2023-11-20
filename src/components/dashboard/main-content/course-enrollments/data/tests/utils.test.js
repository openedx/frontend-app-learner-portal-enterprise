import { camelCaseObject } from '@edx/frontend-platform';

import { COURSE_STATUSES } from '../constants';
import {
  transformCourseEnrollment, groupCourseEnrollmentsByStatus, transformSubsidyRequest, isAssignmentExpired,
  sortAssignmentsByAssignmentStatus,
} from '../utils';
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
      isCourseAssigned: false,
      isRevoked: originalCourseEnrollment.isRevoked,
      notifications: originalCourseEnrollment.dueDates,
      canUnenroll: false,
    };
    expect(transformCourseEnrollment(originalCourseEnrollment)).toEqual(transformedCourseEnrollment);
  });

  it.each([
    { status: COURSE_STATUSES.inProgress, certificateUrl: null, canUnenroll: true },
    { status: COURSE_STATUSES.upcoming, certificateUrl: null, canUnenroll: true },
    { status: COURSE_STATUSES.completed, certificateUrl: null, canUnenroll: true },
    { status: COURSE_STATUSES.completed, certificateUrl: 'http://certificate.url', canUnenroll: false },
    { status: COURSE_STATUSES.requested, certificateUrl: null, canUnenroll: false },
  ])('handles unenrollable course enrollments for status %s', ({ status, certificateUrl, canUnenroll }) => {
    const originalCourseEnrollment = createRawCourseEnrollment({
      courseRunStatus: status,
      certificateDownloadUrl: certificateUrl,
    });
    const transformedCourseEnrollment = {
      completed: originalCourseEnrollment.completed,
      courseRunId: originalCourseEnrollment.courseRunId,
      courseRunStatus: originalCourseEnrollment.courseRunStatus,
      title: originalCourseEnrollment.displayName,
      microMastersTitle: originalCourseEnrollment.micromastersTitle,
      linkToCourse: originalCourseEnrollment.resumeCourseRunUrl,
      linkToCertificate: originalCourseEnrollment.certificateDownloadUrl,
      hasEmailsEnabled: originalCourseEnrollment.emailsEnabled,
      isCourseAssigned: false,
      isRevoked: originalCourseEnrollment.isRevoked,
      notifications: originalCourseEnrollment.dueDates,
      canUnenroll,
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
      course_partners: [{ name: 'edX' }, { name: 'Open edX' }],
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
    const subsidyRequestCamelCased = camelCaseObject(subsidyRequest);

    const expectedTransformedSubsidyRequest = {
      courseRunId: subsidyRequestCamelCased.courseId,
      title: subsidyRequestCamelCased.courseTitle,
      orgName: subsidyRequestCamelCased.coursePartners.map(partner => partner.name).join(', '),
      courseRunStatus: COURSE_STATUSES.requested,
      linkToCourse: `${slug}/course/${subsidyRequestCamelCased.courseId}`,
      created: subsidyRequestCamelCased.created,
      notifications: [],
    };
    const actualTransformedSubsidyRequest = transformSubsidyRequest({ subsidyRequest: subsidyRequestCamelCased, slug });
    expect(actualTransformedSubsidyRequest).toEqual(expectedTransformedSubsidyRequest);
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
        assigned: [],
      },
    );
  });
});

describe('isAssignmentExpired', () => {
  const currentDate = new Date();
  const futureDate = new Date(currentDate.getTime() + 1000 * 60 * 60 * 24 * 10); // 10 days in the future
  const pastDate = new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 10); // 10 days in the past

  it('checks if an allocated assignment is not expired', () => {
    const allocatedAssignment = {
      actions: [{ actionType: 'allocated', completedAt: pastDate }],
      contentMetadata: { enrollByDate: futureDate },
      subsidyExpirationDate: futureDate,
    };
    expect(isAssignmentExpired(allocatedAssignment)).toBe(false);
  });

  it('checks if an allocated assignment is expired', () => {
    const expiredAssignment = {
      actions: [{ actionType: 'allocated', completedAt: pastDate }],
      contentMetadata: { enrollByDate: pastDate },
      subsidyExpirationDate: pastDate,
    };
    expect(isAssignmentExpired(expiredAssignment)).toBe(true);
  });
});

describe('sortAssignmentsByAssignmentStatus', () => {
  it('sorts assignments by status (cancelled or expired)', () => {
    const cancelledAssignment = {
      state: 'cancelled',
    };

    const validAssignment = {
      state: 'allocated',
    };

    const expectedSortedAssignments = [
      validAssignment,
      cancelledAssignment,
    ];

    const sortedAssignments = sortAssignmentsByAssignmentStatus([
      cancelledAssignment,
      validAssignment,
    ]);

    expect(sortedAssignments).toEqual(expectedSortedAssignments);
  });
});
