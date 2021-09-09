import React, { useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Container, Alert } from '@edx/paragon';

import { useRenderContactHelpText } from '../../utils/hooks';
import {
  ENROLLMENT_FAILED_QUERY_PARAM,
  ENROLLMENT_FAILURE_REASON_QUERY_PARAM,
} from './data/constants';

/**
 * A component to render an alert when a learner fails to enroll in a course for any number of
 * reasons. The contents of the alert are determined by a ``failureReason`` which is passed
 * from the Data Sharing Consent (DSC) page as a query parameter.
 */
const CourseEnrollmentFailedAlert = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const renderContactHelpText = useRenderContactHelpText(enterpriseConfig);

  const { search } = useLocation();
  const [hasEnrollmentFailed, failureReason] = useMemo(
    () => {
      const searchParams = new URLSearchParams(search);
      return [
        searchParams.get(ENROLLMENT_FAILED_QUERY_PARAM),
        searchParams.get(ENROLLMENT_FAILURE_REASON_QUERY_PARAM),
      ];
    },
    [search],
  );

  const failureReasonMessages = {
    dsc_denied: (
      <>
        You were not enrolled in your selected course. In order to enroll, you must accept the data sharing
        consent terms. Please {renderContactHelpText(Alert.Link)} for further information.
      </>
    ),
    verified_mode_unavailable: (
      <>
        You were not enrolled in your selected course as the verified course mode is
        unavailable. Please {renderContactHelpText(Alert.Link)} for further information.
      </>
    ),
  };

  if (!hasEnrollmentFailed || !failureReasonMessages[failureReason]) {
    return null;
  }

  return (
    <Container size="lg" className="pt-3">
      <Alert variant="danger">
        {failureReasonMessages[failureReason]}
      </Alert>
    </Container>
  );
};

export default CourseEnrollmentFailedAlert;
