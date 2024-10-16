import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertModal, Alert, StatefulButton, Button, ActionRow,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';

import { ToastsContext } from '../../../../../Toasts';
import { unenrollFromCourse } from './data';
import { queryEnterpriseCourseEnrollments, queryEnterpriseLearnerDashboardBFF, useEnterpriseCustomer } from '../../../../../app/data';

const btnLabels = {
  default: 'Unenroll',
  pending: 'Unenrolling...',
};

function handleQueriesForUnroll(queryClient, courseRunId, enterpriseCustomer) {
  const enrollmentForCourseFilter = (enrollment) => enrollment.courseRunId !== courseRunId;

  // Determine which BFF queries need to be updated after unenrolling.
  const learnerDashboardBFFQueryKey = queryEnterpriseLearnerDashboardBFF(enterpriseCustomer.uuid).queryKey;
  const bffQueryKeysToUpdate = [learnerDashboardBFFQueryKey];

  // Update the enterpriseCourseEnrollments data in the cache for each BFF query.
  bffQueryKeysToUpdate.forEach((queryKey) => {
    const existingBFFData = queryClient.getQueryData(queryKey);
    const updatedBFFData = {
      ...existingBFFData,
      enterpriseCourseEnrollments: existingBFFData.enterpriseCourseEnrollments.filter(enrollmentForCourseFilter),
    };
    queryClient.setQueryData(queryKey, updatedBFFData);
  });

  // Update the legacy queryEnterpriseCourseEnrollments cache as well.
  const enterpriseCourseEnrollmentsQueryKey = queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid).queryKey;
  const existingCourseEnrollmentsData = queryClient.getQueryData(enterpriseCourseEnrollmentsQueryKey);
  const updatedCourseEnrollmentsData = existingCourseEnrollmentsData.filter(enrollmentForCourseFilter);
  queryClient.setQueryData(enterpriseCourseEnrollmentsQueryKey, updatedCourseEnrollmentsData);
}

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
    handleQueriesForUnroll(queryClient, courseRunId, enterpriseCustomer);
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
