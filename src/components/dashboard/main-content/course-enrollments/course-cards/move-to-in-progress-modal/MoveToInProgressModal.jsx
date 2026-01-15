import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, StandardModal, StatefulButton,
} from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform';
import { FormattedMessage, defineMessages, useIntl } from '@edx/frontend-platform/i18n';

import MoveToInProgressModalContext from './MoveToInProgressModalContext';
import ModalBody from './ModalBody';
import { updateCourseCompleteStatusRequest } from '../mark-complete-modal/data/service';
import { useEnterpriseCustomer } from '../../../../../app/data';

const messages = defineMessages({
  modalTitle: {
    id: 'learner.portal.move.to.in.progress.modal.title',
    defaultMessage: 'Move course to "In Progress"',
    description: 'Title for the move course to in progress modal',
  },
  cancelButton: {
    id: 'learner.portal.move.to.in.progress.modal.cancel.button',
    defaultMessage: 'Cancel',
    description: 'Text for the cancel button',
  },
  confirmButtonDefault: {
    id: 'learner.portal.move.to.in.progress.modal.confirm.button.default',
    defaultMessage: 'Move course to "In Progress"',
    description: 'Default text for the confirm button',
  },
  confirmButtonPending: {
    id: 'learner.portal.move.to.in.progress.modal.confirm.button.pending',
    defaultMessage: 'Moving course to "In Progress"...',
    description: 'Text for the confirm button while moving',
  },
});

const initialState = {
  confirmButtonState: 'default',
  confirmError: null,
  confirmSuccessful: false,
};

const MoveToInProgressModal = ({
  courseId,
  isOpen,
  courseTitle,
  courseLink,
  onSuccess,
  onClose,
}) => {
  const intl = useIntl();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const [
    { confirmButtonState, confirmError, confirmSuccessful },
    setState,
  ] = useState(initialState);

  const contextValue = useMemo(
    () => ({
      courseTitle,
      courseLink,
      confirmError,
    }),
    [courseTitle, courseLink, confirmError],
  );

  const handleConfirmButtonClick = async () => {
    setState({ confirmButtonState: 'pending' });
    try {
      const response = await updateCourseCompleteStatusRequest({
        enterprise_id: enterpriseCustomer.uuid,
        course_id: courseId,
        saved_for_later: false,
      });
      onSuccess({
        response: camelCaseObject(response.data),
        resetModalState: () => setState({ ...initialState }),
      });
    } catch (error) {
      setState({
        confirmButtonState: 'default',
        confirmError: error,
      });
    }
  };

  const handleModalOnClose = () => {
    setState({ ...initialState });
    onClose();
  };

  return (
    <MoveToInProgressModalContext.Provider value={contextValue}>
      <StandardModal
        title={intl.formatMessage(messages.modalTitle)}
        isOpen={isOpen && !confirmSuccessful}
        onClose={handleModalOnClose}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={onClose}>
              <FormattedMessage {...messages.cancelButton} />
            </Button>
            <StatefulButton
              labels={{
                default: intl.formatMessage(messages.confirmButtonDefault),
                pending: intl.formatMessage(messages.confirmButtonPending),
              }}
              disabledStates={['pending']}
              className="confirm-move-to-in-progress-btn btn-primary btn-brand-primary"
              state={confirmButtonState}
              onClick={handleConfirmButtonClick}
            />
          </ActionRow>
        )}
        isOverflowVisible={false}
        hasCloseButton
        isFullscreenOnMobile
      >
        <ModalBody />
      </StandardModal>
    </MoveToInProgressModalContext.Provider>
  );
};

MoveToInProgressModal.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseTitle: PropTypes.string.isRequired,
  courseLink: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
};

MoveToInProgressModal.defaultProps = {
  isOpen: false,
};

export default MoveToInProgressModal;
