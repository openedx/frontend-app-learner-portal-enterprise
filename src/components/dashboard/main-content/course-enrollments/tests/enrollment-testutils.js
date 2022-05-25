import { COURSE_STATUSES } from '../data/constants';
import { factory } from '../../../../../utils/tests';

export const courseEnrollmentFactory = factory.object({
  courseRunId: factory.index(i => `$course-v1:edX+DemoX+Demo_Course-${i}`),
  courseRunStatus: COURSE_STATUSES.inProgress,
  linkToCourse: 'https://edx.org/',
  title: factory.index(i => `edX Demonstration Course-${i}`),
  notifications: [],
  created: '2017-02-05T05:00:00Z',
  startDate: '2017-02-05T05:00:00Z',
  endDate: '2018-08-18T05:00:00Z',
  hasEmailsEnabled: true,
  isRevoked: false,
});

/**
 * Generate an enrollment with given status.
 * Can be used as a baseline to override and generate new courseRuns.
 */
export const createCourseEnrollmentWithStatus = (courseRunStatus = COURSE_STATUSES.inProgress) => (
  courseEnrollmentFactory.create({ courseRunStatus })
);

export const rawCourseEnrollmentFactory = factory.object({
  courseRunId: factory.index((i) => `course-v1:Best+course+${i}`),
  displayName: 'Best course',
  micromastersTitle: 'Greatest Micromasters',
  resumeCourseRunUrl: 'http://www.resumecourserun.com',
  certificateDownloadUrl: 'http://www.certificatehere.com',
  emailsEnabled: true,
  dueDates: [],
  completed: false,
  courseRunStatus: COURSE_STATUSES.inProgress,
  isRevoked: false,
});

export const createRawCourseEnrollment = () => rawCourseEnrollmentFactory.create();

export const programEnrollmentFactory = factory.object({
  programUuid: factory.index(),
  id: factory.index(),
  enterpriseCourseEnrollments: factory.list(2, rawCourseEnrollmentFactory),
});
