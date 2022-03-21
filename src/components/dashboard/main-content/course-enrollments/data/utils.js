import moment from 'moment';
import { COURSE_STATUSES } from './constants';

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

  // Delete renamed/unused fields
  delete courseEnrollment.displayName;
  delete courseEnrollment.micromastersTitle;
  delete courseEnrollment.resumeCourseRunUrl;
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
  enrollments.sort((c1, c2) => moment(c1.created) - moment(c2.created));
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
  courseRunStatus: COURSE_STATUSES.requested,
  linkToCourse: `${slug}/course/${subsidyRequest.courseId}`,
  created: subsidyRequest.created,
});
