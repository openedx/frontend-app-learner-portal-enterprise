import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Container, Alert } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

import { useRenderContactHelpText } from '../../utils/hooks';
import {
  ENROLLMENT_COURSE_RUN_KEY_QUERY_PARAM,
  ENROLLMENT_FAILED_QUERY_PARAM,
  ENROLLMENT_FAILURE_REASON_QUERY_PARAM,
} from './data/constants';
import { CourseEnrollmentsContext } from '../dashboard/main-content/course-enrollments/CourseEnrollmentsContextProvider';

export const ENROLLMENT_SOURCE = {
  DASHBOARD: 'DASHBOARD',
  COURSE_PAGE: 'COURSE_PAGE',
};

const createEnrollmentFailureMessages = (contactHelpText) => ({
  dsc_denied: (
    <>
      You were not enrolled in your selected course. In order to enroll, you must accept the data sharing
      consent terms. Please {contactHelpText} for further information.
    </>
  ),
  verified_mode_unavailable: (
    <>
      You were not enrolled in your selected course as the verified course mode is
      unavailable. Please {contactHelpText} for further information.
    </>
  ),
  default: (
    <>
      You were not enrolled in your selected course. Please
      {' '}{contactHelpText} for further information.
    </>
  ),
});

const createUpgradeFailureMessages = (contactHelpText, enrollmentSource) => ({
  dsc_denied: (
    <>
      You were not able to access your selected course. To access the course,{' '}
      {enrollmentSource === ENROLLMENT_SOURCE.DASHBOARD
        ? 'please select "Continue learning" under your course and accept the data sharing consent terms.'
        : 'please accept the data sharing consent terms.'}
    </>
  ),
  verified_mode_unavailable: (
    <>
      You were not able to access your selected course as the verified course mode is
      unavailable. Please {contactHelpText} for further information.
    </>
  ),
  default: (
    <>
      You were not able to access your selected course. Please
      {' '}{contactHelpText} for further information.
    </>
  ),
});

/**
 * A component to render an alert when a learner fails to enroll in a course for any number of
 * reasons. The contents of the alert are determined by a ``failureReason`` which is passed
 * from the Data Sharing Consent (DSC) page as a query parameter.
 */
const CourseEnrollmentFailedAlert = ({ className, enrollmentSource }) => {
  const { search } = useLocation();
  const { enterpriseConfig } = useContext(AppContext);
  const renderContactHelpText = useRenderContactHelpText(enterpriseConfig);
  const { courseEnrollmentsByStatus } = useContext(CourseEnrollmentsContext);

  const [hasEnrollmentFailed, failureReason, courseRunKey] = useMemo(
    () => {
      const searchParams = new URLSearchParams(search);
      return [
        searchParams.get(ENROLLMENT_FAILED_QUERY_PARAM),
        searchParams.get(ENROLLMENT_FAILURE_REASON_QUERY_PARAM),
        searchParams.get(ENROLLMENT_COURSE_RUN_KEY_QUERY_PARAM),
      ];
    },
    [search],
  );

  const isUpgradeAttempt = useMemo(
    () => !!(Object.values(courseEnrollmentsByStatus).flat()).find(
      enrollment => enrollment.courseRunId === courseRunKey,
    ),
    [courseEnrollmentsByStatus, courseRunKey],
  );

  const failureReasonMessages = useMemo(
    () => {
      const contactHelpText = renderContactHelpText(Alert.Link);
      return isUpgradeAttempt ? createUpgradeFailureMessages(contactHelpText, enrollmentSource)
        : createEnrollmentFailureMessages(contactHelpText);
    },
    [enrollmentSource, isUpgradeAttempt, renderContactHelpText],
  );

  if (!hasEnrollmentFailed) {
    return null;
  }

  return (
    <Container size="lg" className={className}>
      <Alert variant="danger" icon={Error}>
        {failureReasonMessages[failureReason] || failureReasonMessages.default}
      </Alert>
    </Container>
  );
};

CourseEnrollmentFailedAlert.defaultProps = {
  className: 'mt-3',
};

CourseEnrollmentFailedAlert.propTypes = {
  className: PropTypes.string,
  enrollmentSource: PropTypes.oneOf(
    Object.values(ENROLLMENT_SOURCE),
  ).isRequired,
};

export default CourseEnrollmentFailedAlert;
