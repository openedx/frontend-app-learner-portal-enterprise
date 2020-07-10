import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Modal, StatefulButton } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform';

import MoveToInProgressModalContext from './MoveToInProgressModalContext';
import ModalBody from './ModalBody';
import { updateCourseCompleteStatusRequest } from '../mark-complete-modal/data/service';

export const MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL = 'Move course to In Progress';
export const MARK_MOVE_TO_IN_PROGRESS_PENDING_LABEL = 'Moving course to "In Progress"...';

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
  const { enterpriseConfig: { uuid } } = useContext(AppContext);
  const [
    { confirmButtonState, confirmError, confirmSuccessful },
    setState,
  ] = useState(initialState);

  const handleConfirmButtonClick = async () => {
    setState({ confirmButtonState: 'pending' });
    try {
      const response = await updateCourseCompleteStatusRequest({
        enterprise_id: uuid,
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
    <MoveToInProgressModalContext.Provider
      value={{
        courseTitle,
        courseLink,
        confirmError,
      }}
    >
      <Modal
        title="Move course to &quot;In Progress&quot;"
        body={<ModalBody />}
        buttons={[
          <StatefulButton
            labels={{
              default: MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL,
              pending: MARK_MOVE_TO_IN_PROGRESS_PENDING_LABEL,
            }}
            disabledStates={['pending']}
            className="confirm-move-to-in-progress-btn btn-primary btn-brand-primary"
            state={confirmButtonState}
            onClick={handleConfirmButtonClick}
            key="confirm-move-to-in-progress-btn"
          />,
        ]}
        open={isOpen && !confirmSuccessful}
        onClose={handleModalOnClose}
        closeText="Cancel"
      />
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
