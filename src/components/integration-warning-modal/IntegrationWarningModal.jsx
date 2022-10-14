import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { Button, ModalDialog, ActionRow } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { MODAL_BUTTON_TEXT, MODAL_TITLE } from './data/constants';
import ModalBody from './ModalBody';

const IntegrationWarningModal = ({
  isOpen,
}) => {
  const config = getConfig();
  const cookies = new Cookies();
  const isWarningDismissed = () => {
    const isDismissed = cookies.get(config.INTEGRATION_WARNING_DISMISSED_COOKIE_NAME);
    return !!isDismissed;
  };
  const handleModalOnClose = () => {
    cookies.set(config.INTEGRATION_WARNING_DISMISSED_COOKIE_NAME, true, { path: '/' });
  };

  const [dismissed, setState] = useState(isOpen && !isWarningDismissed());
  const handleButtonClick = () => {
    handleModalOnClose();
    setState(false);
  };
  return (
    <div>
      <ModalDialog
        title="Modal Dialog"
        isOpen={dismissed}
        onClose={handleModalOnClose}
        hasCloseButton={false}
      >

        <ModalDialog.Header>
          <ModalDialog.Title>
            {MODAL_TITLE}
          </ModalDialog.Title>
        </ModalDialog.Header>

        <ModalDialog.Body>
          <ModalBody />
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="link">
              Close
            </ModalDialog.CloseButton>
            <Button
              variant="primary"
              onClick={handleButtonClick}
            >
              {MODAL_BUTTON_TEXT}
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </div>
  );
};

IntegrationWarningModal.propTypes = {
  isOpen: PropTypes.bool,
};

IntegrationWarningModal.defaultProps = {
  isOpen: true,
};

export default IntegrationWarningModal;
