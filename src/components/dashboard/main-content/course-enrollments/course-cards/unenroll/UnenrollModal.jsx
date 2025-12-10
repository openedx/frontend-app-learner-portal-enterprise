import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActionRow, Alert, AlertModal, Button, StatefulButton,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';

import { FormattedMessage, defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { ToastsContext } from '../../../../../Toasts';
import { unenrollFromCourse } from './data';
import {
  queryEnterpriseCourseEnrollments,
  queryEnterpriseLearnerDashboardBFF,
  useEnterpriseCustomer,
  useIsBFFEnabled,
} from '../../../../../app/data';

export const messages = defineMessages({
  unenrollModalUnenrollButton: {
    id: 'enterprise.learner_portal.unenroll_modal.button.unenroll',
    defaultMessage: 'Unenroll',
    description: 'Text for the Unenroll button in the confirmation modal',
  },
  unenrollModalTitle: {
    id: 'enterprise.learner_portal.unenroll_modal.title',
    defaultMessage: 'Unenroll from course?',
    description: 'Title text shown in the unenroll confirmation modal',
  },
  unenrollModalKeepLearningButton: {
    id: 'enterprise.learner_portal.unenroll_modal.button.keep_learning',
    defaultMessage: 'Keep learning',
    description: 'Text for the Keep Learning button in the confirmation modal',
  },
  unenrollModalErrorMessage: {
    id: 'enterprise.learner_portal.unenroll_modal.error_message',
    defaultMessage: 'An error occurred while unenrolling from your course. Please try again.',
    description: 'Error message shown when unenrollment fails',
  },
  unenrollModalWarningMessage: {
    id: 'enterprise.learner_portal.unenroll_modal.warning_message',
    defaultMessage: 'Progress that you\'ve made so far will not be saved.',
    description: 'Warning message about losing progress when unenrolling',
  },
  unenrollModalPendingMessage: {
    id: 'enterprise.learner_portal.unenroll_modal.pending_message',
    defaultMessage: 'Unenrolling...',
    description: 'Unenrolling message after confirming unenrollment',
  },
  unenrollSuccess: {
    id: 'enterprise.unenroll.success',
    defaultMessage: 'You have been unenrolled from the course.',
    description: 'Toast message shown after successful course unenrollment',
  },
});

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

  const isBFFEnabled = useIsBFFEnabled();

  const handleClose = () => {
    setBtnState('default');
    setError(null);
    onClose();
  };
  const intl = useIntl();

  const btnLabels = {
    default: intl.formatMessage(messages.unenrollModalUnenrollButton),
    pending: intl.formatMessage(messages.unenrollModalPendingMessage),
  };

  const updateQueriesAfterUnenrollment = () => {
    const enrollmentForCourseFilter = (enrollment) => enrollment.courseRunId !== courseRunId;

    if (isBFFEnabled) {
      // Determine which BFF queries need to be updated after unenrolling.
      const dashboardBFFQueryKey = queryEnterpriseLearnerDashboardBFF({
        enterpriseSlug: enterpriseCustomer.slug,
      }).queryKey;
      const bffQueryKeysToUpdate = [dashboardBFFQueryKey];
      // Update the enterpriseCourseEnrollments data in the cache for each BFF query.
      bffQueryKeysToUpdate.forEach((queryKey) => {
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData) {
            return oldData;
          }
          return {
            ...oldData,
            enterpriseCourseEnrollments: oldData.enterpriseCourseEnrollments.filter(enrollmentForCourseFilter),
            allEnrollmentsByStatus: Object.keys(oldData.allEnrollmentsByStatus).reduce((acc, status) => {
              const filteredEnrollments = oldData.allEnrollmentsByStatus[status].filter(enrollmentForCourseFilter);
              acc[status] = filteredEnrollments;
              return acc;
            }, {}),
          };
        });
      });
    }

    // Update the legacy queryEnterpriseCourseEnrollments cache as well.
    const enterpriseCourseEnrollmentsQueryKey = queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid).queryKey;
    queryClient.setQueryData(enterpriseCourseEnrollmentsQueryKey, (oldData) => {
      const updatedCourseEnrollmentsData = oldData?.filter(enrollmentForCourseFilter);
      return updatedCourseEnrollmentsData;
    });
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
    updateQueriesAfterUnenrollment();
    addToast(
      intl.formatMessage(messages.unenrollSuccess),
    );
    onSuccess();
  };

  return (
    <AlertModal
      title={intl.formatMessage(messages.unenrollModalTitle)}
      isOpen={isOpen}
      onClose={handleClose}
      footerNode={(
        <ActionRow>
          <Button
            variant="tertiary"
            onClick={handleClose}
          >
            <FormattedMessage {...messages.unenrollModalKeepLearningButton} />
          </Button>
          <StatefulButton
            variant="primary"
            labels={btnLabels}
            state={btnState}
            onClick={handleUnenrollButtonClick}
          >
            <FormattedMessage {...messages.unenrollModalUnenrollButton} />
          </StatefulButton>
        </ActionRow>
      )}
      isOverflowVisible={false}
    >
      <>
        <Alert
          variant="danger"
          show={!!error}
        >
          <p data-testid="unenroll-error-text">
            <FormattedMessage {...messages.unenrollModalErrorMessage} />
          </p>
        </Alert>
        <p>
          <FormattedMessage {...messages.unenrollModalWarningMessage} />
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
