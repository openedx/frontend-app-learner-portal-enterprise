import dayjs from 'dayjs';
import { COURSE_STATUSES } from './constants';
import { ASSIGNMENT_TYPES } from '../../../../enterprise-user-subsidy/enterprise-offers/data/constants';

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
 * Sorts assignments by their status (canceled or expired).
 * @param {array} assignments - Array of assignments to be sorted.
 * @returns {array} - Returns the sorted array of assignments.
 */
export const sortAssignmentsByAssignmentStatus = (assignments) => {
  const assignmentsCopy = [...assignments];
  const sortedAssignments = assignmentsCopy.sort((a, b) => {
    const isAssignmentACanceledOrExpired = ['cancelled', 'expired'].includes(a.state) ? 1 : 0;
    const isAssignmentBCanceledOrExpired = ['cancelled', 'expired'].includes(b.state) ? 1 : 0;
    return isAssignmentACanceledOrExpired - isAssignmentBCanceledOrExpired;
  });
  return sortedAssignments;
};

/**
 * Transforms a learner assignment into the shape expected by CourseCard component(s).
 * @param {*} assignments - Array of assignments to be transformed.
 * @param {*} enterpriseSlug - Slug of the enterprise.
 * @returns {array} - Returns the transformed array of assignments.
 */
export const getTransformedAllocatedAssignments = (assignments, enterpriseSlug) => {
  const updatedAssignments = assignments.map((item) => {
    const isCanceledAssignment = item.state === ASSIGNMENT_TYPES.CANCELED;
    const isExpiredAssignment = item.state === ASSIGNMENT_TYPES.EXPIRED;
    const { date: assignmentEnrollByDeadline } = item.earliestPossibleExpiration;
    return {
      linkToCourse: `/${enterpriseSlug}/course/${item.contentKey}`,
      // Note: we are using `courseRunId` instead of `contentKey` or `courseKey` because the `CourseSection`
      // and `BaseCourseCard` components expect `courseRunId` to be used as the content identifier. Consider
      // refactoring to rename `courseRunId` to `contentKey` in the future given learner content assignments
      // are for top-level courses, not course runs.
      courseRunId: item.contentKey,
      title: item.contentTitle,
      isRevoked: false,
      notifications: [],
      courseRunStatus: COURSE_STATUSES.assigned,
      endDate: item?.contentMetadata?.endDate,
      startDate: item?.contentMetadata?.startDate,
      mode: item?.contentMetadata?.courseType,
      orgName: item?.contentMetadata?.partners[0]?.name,
      enrollBy: assignmentEnrollByDeadline,
      isCanceledAssignment,
      isExpiredAssignment,
      assignmentConfiguration: item.assignmentConfiguration,
      uuid: item.uuid,
    };
  });
  return updatedAssignments;
};
