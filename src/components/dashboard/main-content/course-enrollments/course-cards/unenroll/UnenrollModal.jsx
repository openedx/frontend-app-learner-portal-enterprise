import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertModal, Alert, StatefulButton, Button, ActionRow,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';

import { ToastsContext } from '../../../../../Toasts';
import { unenrollFromCourse } from './data';
import { queryEnterpriseCourseEnrollments, useEnterpriseCustomer } from '../../../../../app/data';

const btnLabels = {
  default: 'Unenroll',
  pending: 'Unenrolling...',
};

const UnenrollModal = ({
  courseRunId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { addToast } = useContext(ToastsContext);
  const queryClient = useQueryClient();
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
      await unenrollFromCourse({ courseId: courseRunId });
    } catch (err) {
      logError(err);
      setError(err);
      setBtnState('default');
      return;
    }
    const enrollmentsQueryKey = queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid).queryKey;
    const existingEnrollments = queryClient.getQueryData(enrollmentsQueryKey);
    // Optimistically remove the unenrolled course from the list of enrollments in
    // the cache for the `queryEnterpriseCourseEnrollments` query.
    queryClient.setQueryData(
      enrollmentsQueryKey,
      existingEnrollments.filter((enrollment) => enrollment.courseRunId !== courseRunId),
    );
    addToast('You have been unenrolled from the course.');
    onSuccess();
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
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default UnenrollModal;
