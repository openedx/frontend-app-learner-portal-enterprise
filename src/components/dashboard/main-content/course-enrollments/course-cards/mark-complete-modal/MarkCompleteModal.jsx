import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, StandardModal, StatefulButton,
} from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform';
import { FormattedMessage, defineMessages, useIntl } from '@edx/frontend-platform/i18n';

import MarkCompleteModalContext from './MarkCompleteModalContext';
import ModalBody from './ModalBody';
import { updateCourseCompleteStatusRequest } from './data/service';
import { useEnterpriseCustomer } from '../../../../../app/data';

const messages = defineMessages({
  modalTitle: {
    id: 'learner.portal.mark.complete.modal.title',
    defaultMessage: 'Save course for later',
    description: 'Title for the save course for later modal',
  },
  cancelButton: {
    id: 'learner.portal.mark.complete.modal.cancel.button',
    defaultMessage: 'Cancel',
    description: 'Text for the cancel button',
  },
  confirmButtonDefault: {
    id: 'learner.portal.mark.complete.modal.confirm.button.default',
    defaultMessage: 'Save course for later',
    description: 'Default text for the confirm button',
  },
  confirmButtonPending: {
    id: 'learner.portal.mark.complete.modal.confirm.button.pending',
    defaultMessage: 'Saving course for later...',
    description: 'Text for the confirm button while saving',
  },
});

const initialState = {
  confirmButtonState: 'default',
  confirmError: null,
  confirmSuccessful: false,
};

const MarkCompleteModal = ({
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

  const contextValue = useMemo(() => ({
    courseTitle,
    courseLink,
    confirmError,
  }), [courseTitle, courseLink, confirmError]);

  const handleConfirmButtonClick = async () => {
    setState({ confirmButtonState: 'pending' });
    try {
      const response = await updateCourseCompleteStatusRequest({
        enterprise_id: enterpriseCustomer.uuid,
        course_id: courseId,
        saved_for_later: true,
      });
      onSuccess({
        response: camelCaseObject(response.data),
        /**
         * We're passing a function to reset the `MarkCompleteModal` state
         * to its initial state here. That way, the consumer of this component
         * can call this function to reset the modal state. When the `open` prop
         * on the Paragon `Modal` component changes to false, it doesn't trigger
         * the `onClose` callback, another place where we reset to initial state.
         * Because of this, passing the `resetModalState` function gives control
         * to the consumer of this component to reset to initial state as needed.
         */
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
    <MarkCompleteModalContext.Provider value={contextValue}>
      <StandardModal
        title={intl.formatMessage(messages.modalTitle)}
        isOpen={isOpen && !confirmSuccessful}
        onClose={handleModalOnClose}
        hasCloseButton
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={handleModalOnClose} data-testid="mark-complete-modal-cancel-btn">
              <FormattedMessage {...messages.cancelButton} />
            </Button>
            <StatefulButton
              labels={{
                default: intl.formatMessage(messages.confirmButtonDefault),
                pending: intl.formatMessage(messages.confirmButtonPending),
              }}
              disabledStates={['pending']}
              className="confirm-mark-complete-btn btn-brand-primary"
              state={confirmButtonState}
              onClick={handleConfirmButtonClick}
            />
          </ActionRow>
        )}
        isOverflowVisible={false}
        isFullscreenOnMobile
      >
        <ModalBody />
      </StandardModal>
    </MarkCompleteModalContext.Provider>
  );
};

MarkCompleteModal.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseTitle: PropTypes.string.isRequired,
  courseLink: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
};

MarkCompleteModal.defaultProps = {
  isOpen: false,
};

export default MarkCompleteModal;
