import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  AlertModal, Alert, StatefulButton, Button, ActionRow,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';

import { CourseEnrollmentsContext } from '../../CourseEnrollmentsContextProvider';
import { unenrollFromCourse } from './data';

const btnLabels = {
  default: 'Unenroll',
  pending: 'Unenrolling...',
};

export default function UnenrollModal({
  courseRunId,
  courseRunTitle,
  enrollmentType,
  isOpen,
  onClose,
  onSuccess,
}) {
  const { removeCourseEnrollment } = useContext(CourseEnrollmentsContext);

  const [btnState, setBtnState] = useState('default');
  const [error, setError] = useState(null);

  const handleClose = () => {
    setBtnState('default');
    setError(null);
    onClose();
  };

  const handleUnenrollButtonClick = async () => {
    setBtnState('pending');
    try {
      await unenrollFromCourse({
        courseId: courseRunId,
      });
      removeCourseEnrollment({ courseRunId, enrollmentType });
      onSuccess();
    } catch (err) {
      logError(err);
      setError(err);
      setBtnState('default');
    }
  };

  return (
    <AlertModal
      title="Confirm unenrollment"
      isOpen={isOpen}
      onClose={handleClose}
      footerNode={(
        <ActionRow>
          <Button
            variant="tertiary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <StatefulButton
            variant="danger"
            labels={btnLabels}
            state={btnState}
            onClick={handleUnenrollButtonClick}
          >
            Unenroll
          </StatefulButton>
        </ActionRow>
      )}
    >
      <>
        <Alert
          variant="danger"
          show={!!error}
        >
          <p data-testid="unenroll-error-text">
            An error occurred while unenrolling from your course. Please try again.
          </p>
        </Alert>
        <p>
          Are you sure you want to unenroll from {courseRunTitle}?
        </p>
      </>
    </AlertModal>
  );
}

UnenrollModal.propTypes = {
  courseRunId: PropTypes.string.isRequired,
  courseRunTitle: PropTypes.string.isRequired,
  enrollmentType: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
