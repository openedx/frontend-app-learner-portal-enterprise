import dayjs from 'dayjs';
import { COURSE_STATUSES } from './constants';
import { getTodaysDate } from '../../../../../utils/dayjs';

/**
 * Determines whether a course enrollment may be unenrolled based on its enrollment
 * status (e.g., in progress, completed) and enrollment completion.
 *
 * @param {Object} courseEnrollment Data for an enterprise course enrollment.
 * @returns True if the enrollment can be unenrolled. False if not.
 */
export const canUnenrollCourseEnrollment = (courseEnrollment) => {
  const unenrollableCourseRunTypes = new Set([
    COURSE_STATUSES.inProgress,
    COURSE_STATUSES.upcoming,
    COURSE_STATUSES.completed,
    COURSE_STATUSES.savedForLater,
  ]);
  return (
    unenrollableCourseRunTypes.has(courseEnrollment.courseRunStatus)
    && !courseEnrollment.certificateDownloadUrl
  );
};

export const transformCourseEnrollment = (rawCourseEnrollment) => {
  const courseEnrollment = { ...rawCourseEnrollment };

  // Return the fields expected by the component(s)
  courseEnrollment.title = courseEnrollment.displayName;
  courseEnrollment.microMastersTitle = courseEnrollment.micromastersTitle;
  // The link to course here gives precedence to the resume course link, which is
  // present if the learner has made progress. If the learner has not made progress,
  // we should link to the main course run URL. Similarly, if the resume course link
  // is not set in the API response, we should fallback on the normal course link.
  courseEnrollment.linkToCourse = courseEnrollment.resumeCourseRunUrl || courseEnrollment.courseRunUrl;
  courseEnrollment.linkToCertificate = courseEnrollment.certificateDownloadUrl;
  courseEnrollment.hasEmailsEnabled = courseEnrollment.emailsEnabled;
  courseEnrollment.notifications = courseEnrollment.dueDates;
  courseEnrollment.canUnenroll = canUnenrollCourseEnrollment(courseEnrollment);
  courseEnrollment.isCourseAssigned = false;

  // Delete renamed/unused fields
  delete courseEnrollment.displayName;
  delete courseEnrollment.micromastersTitle;
  delete courseEnrollment.courseRunUrl;
  delete courseEnrollment.certificateDownloadUrl;
  delete courseEnrollment.emailsEnabled;
  delete courseEnrollment.dueDates;

  return courseEnrollment;
};

export const groupCourseEnrollmentsByStatus = (courseEnrollments) => {
  const courseEnrollmentsByStatus = Object.keys(COURSE_STATUSES).reduce((acc, status) => {
    acc[status] = courseEnrollments ? courseEnrollments.filter(
      courseEnrollment => courseEnrollment.courseRunStatus === COURSE_STATUSES[status],
    ) : [];
    return acc;
  }, {});

  return courseEnrollmentsByStatus;
};

export const sortedEnrollmentsByEnrollmentDate = (enrollments) => {
  enrollments.sort((c1, c2) => dayjs(c1.created) - dayjs(c2.created));
  return enrollments;
};

/**
 * Transforms a subsidy request into the shape expected by CourseCard component(s).
 * @param {{subsidyRequest: Object, slug: string}} args the subsidy request and slug to use for course link
 *
 * @returns {Object} { courseRunId, title, courseRunStatus, linkToCourse, created }
 */
export const transformSubsidyRequest = ({
  subsidyRequest,
  slug,
}) => ({
  courseRunId: subsidyRequest.courseId,
  title: subsidyRequest.courseTitle,
  orgName: subsidyRequest.coursePartners?.map(partner => partner.name).join(', '),
  courseRunStatus: COURSE_STATUSES.requested,
  linkToCourse: `${slug}/course/${subsidyRequest.courseId}`,
  created: subsidyRequest.created,
  notifications: [], // required prop by CourseSection
});

/**
 * Checks if an assignment has expired based on following conditions:
 * - The assignment's lifecycle state is "allocated."
 * - 90 days have passed since the "created" date.
 * - The course enrollment deadline has passed.
 * - The subsidy expiration date has passed.
 * @param {object} assignment - Information about the assignment.
 * @returns {boolean} - Returns true if the assignment has expired, otherwise false.
 */
export const isAssignmentExpired = (assignment) => {
  // Assignment is not in an allocated state, so it cannot be expired.
  if (!assignment) {
    return false;
  }

  const currentDate = dayjs(getTodaysDate());
  const allocationDate = dayjs(assignment.created);
  const enrollmentEndDate = dayjs(assignment.contentMetadata.enrollByDate);
  const subsidyExpirationDate = dayjs(assignment.subsidyExpirationDate);

  return (
    currentDate.diff(allocationDate, 'day') > 90
    || currentDate.isAfter(enrollmentEndDate)
    || currentDate.isAfter(subsidyExpirationDate)
  );
};

/**
 * Sorts assignments by their status (cancelled or expired).
 * @param {array} assignments - Array of assignments to be sorted.
 * @returns {array} - Returns the sorted array of assignments.
 */
export const sortAssignmentsByAssignmentStatus = (assignments) => {
  if (assignments) {
    const sortedAssignments = [...assignments].sort((a, b) => (
      ((a.state === 'cancelled' || isAssignmentExpired(a)) ? 1 : 0)
    - ((b.state === 'cancelled' || isAssignmentExpired(b)) ? 1 : 0)
    ));
    return sortedAssignments;
  }
  return [];
};

export const getTransformedAllocatedAssignments = (assignments, slug) => {
  if (!assignments) { return assignments; }
  const updatedAssignments = assignments?.map((item) => {
    const isCancelledAssignment = item.state === 'cancelled';
    const isExpiredAssignment = isAssignmentExpired(item);

    return {
      linkToCourse: `/${slug}/course/${item.contentKey}`,
      courseKey: item.contentKey,
      title: item.contentTitle,
      isRevoked: false,
      courseRunStatus: COURSE_STATUSES.assigned,
      endDate: item?.contentMetadata?.endDate,
      startDate: item?.contentMetadata?.startDate,
      mode: item?.contentMetadata?.courseType,
      orgName: item?.contentMetadata?.partners[0]?.name,
      enrollBy: item?.contentMetadata?.enrollByDate,
      isCancelledAssignment,
      isExpiredAssignment,
    };
  });
  return updatedAssignments;
};
