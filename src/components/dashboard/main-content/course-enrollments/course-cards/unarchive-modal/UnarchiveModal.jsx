import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Modal, StatefulButton } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform';

import UnarchiveModalContext from './UnarchiveModalContext';
import ModalBody from './ModalBody';
import { updateCourseCompleteStatusRequest } from '../mark-complete-modal/data/service';

export const MARK_UNARCHIVED_DEFAULT_LABEL = 'Unarchived course';
export const MARK_UNARCHIVED_PENDING_LABEL = 'Unarchiving course...';

const initialState = {
  confirmButtonState: 'default',
  confirmError: null,
  confirmSuccessful: false,
};

const UnarchiveModal = ({
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
        marked_done: 'False',
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
    <UnarchiveModalContext.Provider
      value={{
        courseTitle,
        courseLink,
        confirmError,
      }}
    >
      <Modal
        title="Unarchive course"
        body={<ModalBody />}
        buttons={[
          <StatefulButton
            labels={{
              default: MARK_UNARCHIVED_DEFAULT_LABEL,
              pending: MARK_UNARCHIVED_PENDING_LABEL,
            }}
            disabledStates={['pending']}
            className="confirm-unarchive-btn btn-primary"
            state={confirmButtonState}
            onClick={handleConfirmButtonClick}
            key="confirm-unarchive-btn"
          />,
        ]}
        open={isOpen && !confirmSuccessful}
        onClose={handleModalOnClose}
        closeText="Cancel"
      />
    </UnarchiveModalContext.Provider>
  );
};

UnarchiveModal.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseTitle: PropTypes.string.isRequired,
  courseLink: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
};

UnarchiveModal.defaultProps = {
  isOpen: false,
};

export default UnarchiveModal;
