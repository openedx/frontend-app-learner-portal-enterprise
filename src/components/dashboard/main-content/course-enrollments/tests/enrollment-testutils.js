import { COURSE_STATUSES } from '../data/constants';

/**
 * Generate an enrollment with given status.
 * Can be used as a baseline to override and generate new courseRuns.
 */
const createCourseEnrollmentWithStatus = (status = COURSE_STATUSES.inProgress) => ({
  courseRunId: 'course-v1:edX+DemoX+Demo_Course',
  courseRunStatus: status,
  linkToCourse: 'https://edx.org/',
  title: 'edX Demonstration Course',
  notifications: [],
  startDate: '2017-02-05T05:00:00Z',
  endDate: '2018-08-18T05:00:00Z',
  hasEmailsEnabled: true,
  isRevoked: false,
});

const createRawCourseEnrollment = () => ({
  courseRunId: 'course-v1:Best+course',
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

export {
  createCourseEnrollmentWithStatus,
  createRawCourseEnrollment,
};
