import { COURSE_STATUSES } from '../data/constants';

/**
 * Generate an enrollment with given status.
 * Can be used as a baseline to override and generate new courseRuns.
 */
const createCourseEnrollmentWithStatus = (
  {
    status = COURSE_STATUSES.inProgress,
    mode = 'verified',
    isCancelledAssignment = false,
    start = '2017-02-05T05:00:00Z',
    end = '2018-08-18T05:00:00Z',
  },
) => {
  const randomNumber = Math.random();
  return ({
    courseKey: 'edX+DemoX',
    courseRunId: `$course-v1:edX+DemoX+Demo_Course-${randomNumber}`,
    courseRunStatus: status,
    linkToCourse: 'https://edx.org/',
    title: `edX Demonstration Course-${randomNumber}`,
    notifications: [],
    created: '2017-02-05T05:00:00Z',
    startDate: start,
    endDate: end,
    hasEmailsEnabled: true,
    isRevoked: false,
    mode,
    isCancelledAssignment,
  });
};

const createRawCourseEnrollment = (options) => ({
  courseKey: 'edX+DemoX',
  courseRunId: 'course-v1:Best+course+2T2025',
  displayName: 'Best course',
  micromastersTitle: 'Greatest Micromasters',
  resumeCourseRunUrl: 'http://www.resumecourserun.com',
  certificateDownloadUrl: 'http://www.certificatehere.com',
  emailsEnabled: true,
  dueDates: [],
  completed: false,
  courseRunStatus: COURSE_STATUSES.inProgress,
  isRevoked: false,
  ...options,
});

export {
  createCourseEnrollmentWithStatus,
  createRawCourseEnrollment,
};
