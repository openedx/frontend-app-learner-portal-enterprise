import {
  Col, Icon, Row, Stack,
} from '@openedx/paragon';
import { Calendar } from '@openedx/paragon/icons';
import dayjs from 'dayjs';
import { useParams, useSearchParams } from 'react-router-dom';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { DATE_FORMAT } from '../data';
import {
  determineAllocatedCourseRuns,
  getSoonestEarliestPossibleExpirationData,
  useCourseMetadata,
  useRedeemablePolicies,
} from '../../app/data';

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

const CourseImportantDates = () => {
  const { courseKey } = useParams();
  const { data: redeemableLearnerCreditPolicies } = useRedeemablePolicies();
  const { data: courseMetadata } = useCourseMetadata();
  const intl = useIntl();
  const {
    allocatedCourseRunAssignments,
    allocatedCourseRunAssignmentKeys,
    hasAssignedCourseRuns,
  } = determineAllocatedCourseRuns({
    redeemableLearnerCreditPolicies,
    courseKey,
  });

  const [searchParams] = useSearchParams();
  const courseRunKey = searchParams.get('course_run_key')?.replaceAll(' ', '+');

  if (!hasAssignedCourseRuns || (!!courseRunKey && !allocatedCourseRunAssignmentKeys.includes(courseRunKey))) {
    return null;
  }

  const { date, soonestExpirationDateData } = getSoonestEarliestPossibleExpirationData({
    assignmentObjectArray: allocatedCourseRunAssignments,
    dateFormat: `${DATE_FORMAT} h:mm A`,
  });
  const soonestExpiringAllocatedAssignmentCourseStartDate = courseMetadata.availableCourseRuns.find(
    (courseRun) => courseRun.key === soonestExpirationDateData?.contentKey,
  )?.start;

  const enrollByDate = date;
  const courseStartDate = dayjs(soonestExpiringAllocatedAssignmentCourseStartDate).format(DATE_FORMAT);
  const hasCourseStarted = dayjs(courseStartDate).isBefore(dayjs());

  return (
    <Stack gap={2} className="mt-4">
      <h3>{intl.formatMessage(messages.importantDates)}</h3>
      <section>
        {enrollByDate && (
          <Row>
            <Col>
              <Stack direction="horizontal" gap={2}>
                <Icon src={Calendar} />
                {intl.formatMessage(messages.enrollByDate)}
              </Stack>
            </Col>
            <Col>
              {enrollByDate}
            </Col>
          </Row>
        )}
        {enrollByDate && courseStartDate && <hr />}
        {courseStartDate && (
          <Row>
            <Col>
              <Stack direction="horizontal" gap={2}>
                <Icon src={Calendar} />
                {
                  hasCourseStarted
                    ? intl.formatMessage(messages.courseStarted)
                    : intl.formatMessage(messages.courseStarts)
                }
              </Stack>
            </Col>
            <Col>
              {courseStartDate}
            </Col>
          </Row>
        )}
      </section>
    </Stack>
  );
};

export default CourseImportantDates;
