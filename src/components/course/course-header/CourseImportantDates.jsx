import {
  Col, Icon, Row, Stack,
} from '@openedx/paragon';
import { Calendar } from '@openedx/paragon/icons';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import {
  DATE_FORMAT,
  DATETIME_FORMAT,
  getSoonestEarliestPossibleExpirationData,
  hasCourseStarted,
  useIsCourseAssigned,
} from '../data';
import { useCourseMetadata } from '../../app/data';

const messages = defineMessages({
  importantDates: {
    id: 'enterprise.course.about.page.important-dates.title',
    defaultMessage: 'Important dates',
    description: 'Title for the important dates section on the course about page',
  },
  enrollByDate: {
    id: 'enterprise.course.about.page.important-dates.enroll-by-date',
    defaultMessage: 'Enroll-by date',
    description: 'Enroll-by date for the important dates section on the course about page',
  },
  courseStarts: {
    id: 'enterprise.course.about.page.important-dates.course-starts',
    defaultMessage: 'Course starts',
    description: 'Course starts for the important dates section on the course about page in future tense',
  },
  courseStarted: {
    id: 'enterprise.course.about.page.important-dates.course-started',
    defaultMessage: 'Course started',
    description: 'Course started the important dates section on the course about page in past tense',
  },
});

const CourseImportantDate = ({
  label,
  children,
}) => (
  <Row className="course-important-date border-bottom mx-0 py-2.5">
    <Col className="px-0">
      <Stack direction="horizontal" gap={2}>
        <Icon size="sm" src={Calendar} />
        {label}
      </Stack>
    </Col>
    <Col>
      {children}
    </Col>
  </Row>
);

CourseImportantDate.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const CourseImportantDates = () => {
  const { data: courseMetadata } = useCourseMetadata();
  const intl = useIntl();
  const {
    allocatedCourseRunAssignments,
    allocatedCourseRunAssignmentKeys,
    hasAssignedCourseRuns,
  } = useIsCourseAssigned();

  const [searchParams] = useSearchParams();
  const courseRunKey = searchParams.get('course_run_key')?.replaceAll(' ', '+');
  // Check if the corresponding course run key from query parameters matches an allocated assignment course run key
  const doesNotHaveCourseRunAssignmentForCourseRunKey = !!courseRunKey && !allocatedCourseRunAssignmentKeys.includes(
    courseRunKey,
  );
  if (!hasAssignedCourseRuns || doesNotHaveCourseRunAssignmentForCourseRunKey) {
    return null;
  }

  // Retrieve soonest expiring enroll-by date
  const { soonestExpirationDate, soonestExpiringAssignment } = getSoonestEarliestPossibleExpirationData({
    assignments: allocatedCourseRunAssignments,
    dateFormat: DATETIME_FORMAT,
  });

  // Match soonest expiring assignment to the corresponding course start date from course metadata
  let soonestExpiringAllocatedAssignmentCourseStartDate = null;
  if (soonestExpiringAssignment) {
    soonestExpiringAllocatedAssignmentCourseStartDate = courseMetadata.availableCourseRuns.find(
      (courseRun) => courseRun.key === soonestExpiringAssignment?.contentKey,
    )?.start;
  }

  // Parse logic of date existence and labels
  const enrollByDate = soonestExpirationDate ?? null;
  const courseStartDate = soonestExpiringAllocatedAssignmentCourseStartDate
    ? dayjs(soonestExpiringAllocatedAssignmentCourseStartDate).format(DATE_FORMAT)
    : null;
  const courseHasStartedLabel = hasCourseStarted(courseStartDate)
    ? intl.formatMessage(messages.courseStarted)
    : intl.formatMessage(messages.courseStarts);

  if (!enrollByDate && !courseStartDate) {
    return null;
  }

  return (
    <section className="assignments-important-dates mt-4 small">
      <h3>
        {intl.formatMessage(messages.importantDates)}
      </h3>
      {enrollByDate && (
        <CourseImportantDate label={intl.formatMessage(messages.enrollByDate)}>
          {enrollByDate}
        </CourseImportantDate>
      )}
      {courseStartDate && (
        <CourseImportantDate label={courseHasStartedLabel}>
          {courseStartDate}
        </CourseImportantDate>
      )}
    </section>
  );
};

export default CourseImportantDates;
