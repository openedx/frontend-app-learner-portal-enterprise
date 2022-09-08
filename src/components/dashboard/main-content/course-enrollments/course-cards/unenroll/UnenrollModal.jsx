import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  AlertModal, Alert, StatefulButton, Button, ActionRow, Toast,
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
  enrollmentType,
  isOpen,
  onClose,
  onSuccess,
}) {
  const { removeCourseEnrollment } = useContext(CourseEnrollmentsContext);
  const [show, setShow] = useState(false);

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
      setShow(true);
      onSuccess();
    } catch (err) {
      logError(err);
      setError(err);
      setBtnState('default');
    }
  };

  return (
    <>
      <AlertModal
        title="Unenroll from course?"
        isOpen={isOpen}
        onClose={handleClose}
        footerNode={(
          <ActionRow>
            <Button
              variant="tertiary"
              onClick={handleClose}
            >
              Keep learning
            </Button>
            <StatefulButton
              variant="primary"
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
            Progress that you&apos;ve made so far will not be saved.
          </p>
        </>
      </AlertModal>
      <Toast
        onClose={() => setShow(false)}
        show={show}
      >
        You have been unenrolled from the course.
      </Toast>
    </>
  );
}

UnenrollModal.propTypes = {
  courseRunId: PropTypes.string.isRequired,
  enrollmentType: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
