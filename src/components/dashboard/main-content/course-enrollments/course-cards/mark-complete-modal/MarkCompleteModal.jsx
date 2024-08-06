import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, ModalDialog, StatefulButton,
} from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform';

import MarkCompleteModalContext from './MarkCompleteModalContext';
import ModalBody from './ModalBody';
import { updateCourseCompleteStatusRequest } from './data/service';
import { useEnterpriseCustomer } from '../../../../../app/data';

export const MARK_SAVED_FOR_LATER_DEFAULT_LABEL = 'Save course for later';
export const MARK_SAVED_FOR_LATER_PENDING_LABEL = 'Saving course for later...';

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
      <ModalDialog
        title="Save course for later"
        isOpen={isOpen && !confirmSuccessful}
        onClose={handleModalOnClose}
        hasCloseButton
        isFullscreenOnMobile
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            Save course for later
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <ModalBody />
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary" data-testid="mark-complete-modal-cancel-btn">
              Cancel
            </ModalDialog.CloseButton>
            <StatefulButton
              labels={{
                default: MARK_SAVED_FOR_LATER_DEFAULT_LABEL,
                pending: MARK_SAVED_FOR_LATER_PENDING_LABEL,
              }}
              disabledStates={['pending']}
              className="confirm-mark-complete-btn btn-brand-primary"
              state={confirmButtonState}
              onClick={handleConfirmButtonClick}
              key="confirm-mark-complete-btn"
            />
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
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
