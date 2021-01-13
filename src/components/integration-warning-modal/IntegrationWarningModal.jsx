import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { Modal, Button } from '@edx/paragon';
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
      <Modal
        body={<ModalBody />}
        open={dismissed}
        onClose={handleModalOnClose}
        title={MODAL_TITLE}
        closeText={MODAL_BUTTON_TEXT}
        renderHeaderCloseButton={false}
        renderDefaultCloseButton={false}
        buttons={[
          <Button
            variant="primary"
            onClick={handleButtonClick}
          >
            {MODAL_BUTTON_TEXT}
          </Button>,
        ]}
      />
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
