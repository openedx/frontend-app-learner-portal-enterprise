import PropTypes from 'prop-types';
import { Button, Hyperlink } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { findUserEnrollmentForCourseRun } from './data/utils';
import { useCourseMetadata, useEnterpriseCourseEnrollments } from '../app/data';

const CourseMaterialsButton = ({ className }) => {
  const intl = useIntl();

  const { data: courseMetadata } = useCourseMetadata();
  const { data: { enterpriseCourseEnrollments } } = useEnterpriseCourseEnrollments();

  let userEnrollment;
  courseMetadata.courseRuns.forEach((courseRun) => {
    const userEnrollmentForCourseRun = findUserEnrollmentForCourseRun({
      userEnrollments: enterpriseCourseEnrollments,
      key: courseRun.key,
    });
    if (userEnrollmentForCourseRun) {
      userEnrollment = userEnrollmentForCourseRun;
    }
  });

  if (!userEnrollment) {
    return null;
  }

  return (
    <Button
      className={className}
      variant="brand"
      as={Hyperlink}
      destination={userEnrollment.resumeCourseRunUrl || userEnrollment.linkToCourse}
      target="_blank"
    >
      {intl.formatMessage({
        id: 'enterprise.course.about.course.materials.button.label',
        defaultMessage: 'View course materials',
        description: 'Label for the button that allows the learner to view the course materials.',
      })}
    </Button>
  );
};

CourseMaterialsButton.propTypes = {
  className: PropTypes.string,
};

CourseMaterialsButton.defaultProps = {
  className: undefined,
};

export default CourseMaterialsButton;
