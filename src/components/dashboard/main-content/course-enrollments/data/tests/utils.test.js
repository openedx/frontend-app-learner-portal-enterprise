import { camelCaseObject } from '@edx/frontend-platform';
import MockDate from 'mockdate';

import { createRawCourseEnrollment } from '../../tests/enrollment-testutils';
import {
  groupCourseEnrollmentsByStatus,
  transformCourseEnrollment,
  transformSubsidyRequest,
} from '../../../../../app/data';
import { sortAssignmentsByAssignmentStatus } from '../utils';
import { COURSE_STATUSES } from '../../../../../../constants';

describe('transformCourseEnrollment', () => {
  it('should transform a course enrollment', () => {
    const originalCourseEnrollment = createRawCourseEnrollment();

    const transformedCourseEnrollment = {
      courseKey: originalCourseEnrollment.courseKey,
      completed: originalCourseEnrollment.completed,
      courseRunId: originalCourseEnrollment.courseRunId,
      courseRunStatus: originalCourseEnrollment.courseRunStatus,
      title: originalCourseEnrollment.displayName,
      micromastersTitle: originalCourseEnrollment.micromastersTitle,
      linkToCourse: originalCourseEnrollment.resumeCourseRunUrl,
      linkToCertificate: originalCourseEnrollment.certificateDownloadUrl,
      hasEmailsEnabled: originalCourseEnrollment.emailsEnabled,
      isRevoked: originalCourseEnrollment.isRevoked,
      notifications: originalCourseEnrollment.dueDates,
      canUnenroll: false,
      resumeCourseRunUrl: 'http://www.resumecourserun.com',
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
      courseKey: originalCourseEnrollment.courseKey,
      completed: originalCourseEnrollment.completed,
      courseRunId: originalCourseEnrollment.courseRunId,
      courseRunStatus: originalCourseEnrollment.courseRunStatus,
      title: originalCourseEnrollment.displayName,
      micromastersTitle: originalCourseEnrollment.micromastersTitle,
      linkToCourse: originalCourseEnrollment.resumeCourseRunUrl,
      linkToCertificate: originalCourseEnrollment.certificateDownloadUrl,
      hasEmailsEnabled: originalCourseEnrollment.emailsEnabled,
      isRevoked: originalCourseEnrollment.isRevoked,
      notifications: originalCourseEnrollment.dueDates,
      canUnenroll,
      resumeCourseRunUrl: 'http://www.resumecourserun.com',
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
    const courseEnrollmentsByStatus = groupCourseEnrollmentsByStatus([
      savedForLaterCourseEnrollment,
      completedCourseEnrollment,
      upcomingCourseEnrollment,
      inProgressCourseEnrollment,
    ]);
    expect(courseEnrollmentsByStatus).toEqual(
      {
        inProgress: [inProgressCourseEnrollment],
        upcoming: [upcomingCourseEnrollment],
        completed: [completedCourseEnrollment],
        savedForLater: [savedForLaterCourseEnrollment],
      },
    );
  });

  it.each([
    { enrollments: undefined },
    { enrollments: [] },
  ])('should return empty arrays when there are no course enrollments (%s)', ({ enrollments }) => {
    const courseEnrollmentsByStatus = groupCourseEnrollmentsByStatus(enrollments);
    expect(courseEnrollmentsByStatus).toEqual(
      {
        inProgress: [],
        upcoming: [],
        completed: [],
        savedForLater: [],
      },
    );
  });
});

describe('sortAssignmentsByAssignmentStatus', () => {
  beforeAll(() => {
    MockDate.set('2023-04-20');
  });

  afterAll(() => {
    MockDate.reset();
  });

  it('sorts assignments by status (allocated, then cancelled/expired)', () => {
    const baseAssignment = {
      created: '2023-04-20',
      contentMetadata: { enrollByDate: '2023-05-20' },
      subsidyExpirationDate: '2024-04-20',
    };

    const cancelledAssignment = {
      ...baseAssignment,
      state: 'cancelled',
    };

    const validAssignment = {
      ...baseAssignment,
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
