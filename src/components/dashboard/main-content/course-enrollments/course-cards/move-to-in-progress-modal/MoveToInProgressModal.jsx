import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, StandardModal, StatefulButton,
} from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform';

import MoveToInProgressModalContext from './MoveToInProgressModalContext';
import ModalBody from './ModalBody';
import { updateCourseCompleteStatusRequest } from '../mark-complete-modal/data/service';
import { useEnterpriseCustomer } from '../../../../../app/data';

export const MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL = 'Move course to "In Progress"';
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
        title="Move course to &quot;In Progress&quot;"
        isOpen={isOpen && !confirmSuccessful}
        onClose={handleModalOnClose}
        hasCloseButton
        isFullscreenOnMobile
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={onClose}>Cancel</Button>
            <StatefulButton
              labels={{
                default: MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL,
                pending: MARK_MOVE_TO_IN_PROGRESS_PENDING_LABEL,
              }}
              disabledStates={['pending']}
              className="confirm-move-to-in-progress-btn btn-primary btn-brand-primary"
              state={confirmButtonState}
              onClick={handleConfirmButtonClick}
            />
          </ActionRow>
        )}
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
