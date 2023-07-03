import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  AlertModal, Alert, StatefulButton, Button, ActionRow,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';

import { CourseEnrollmentsContext } from '../../CourseEnrollmentsContextProvider';
import { ToastsContext } from '../../../../../Toasts';
import { unenrollFromCourse } from './data';
import { EXEC_ED_COURSE_TYPE, GETSMARTER_BASE_URL, PRODUCT_SOURCE_2U } from '../../data/constants';

const btnLabels = {
  default: 'Unenroll',
  pending: 'Unenrolling...',
};

const UnenrollModal = ({
  courseRunId,
  courseType,
  productSource,
  enrollmentType,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { removeCourseEnrollment } = useContext(CourseEnrollmentsContext);
  const { addToast } = useContext(ToastsContext);

  const [btnState, setBtnState] = useState('default');
  const [error, setError] = useState(null);

  const handleClose = () => {
    setBtnState('default');
    setError(null);
    onClose();
  };

  const handleUnenrollButtonClick = async () => {
    try {
      if (courseType === EXEC_ED_COURSE_TYPE && productSource === PRODUCT_SOURCE_2U) {
        window.location.href = `${GETSMARTER_BASE_URL}/cancel-defer`;
      } else {
        setBtnState('pending');
        await unenrollFromCourse({
          courseId: courseRunId,
        });
        removeCourseEnrollment({ courseRunId, enrollmentType });
        addToast('You have been unenrolled from the course.');
        onSuccess();
      }
    } catch (err) {
      logError(err);
      setError(err);
      setBtnState('default');
    }
  };

  return (
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
  );
};

UnenrollModal.propTypes = {
  courseRunId: PropTypes.string.isRequired,
  enrollmentType: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  courseType: PropTypes.string,
  productSource: PropTypes.string,
};

UnenrollModal.defaultProps = {
  courseType: null,
  productSource: null,
};

export default UnenrollModal;
