import { Modal } from '@edx/paragon';
import React from 'react';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { MODAL_BUTTON_TEXT, MODAL_TITLE } from './data/constants';
import ModalBody from './ModalBody';

const IntegrationWarningModal = ({
  isOpen,
}) => {
  const cookies = new Cookies();
  const isWarningDismissed = () => {
    const isDismissed = cookies.get(process.env.INTEGRATION_WARNING_DISMISSED_COOKIE_NAME);
    return !!isDismissed;
  };
  const handleModalOnClose = () => {
    cookies.set(process.env.INTEGRATION_WARNING_DISMISSED_COOKIE_NAME, true, { path: '/' });
  };
  return (
    <div>
      <Modal
        body={<ModalBody />}
        open={isOpen && !isWarningDismissed()}
        onClose={handleModalOnClose}
        title={MODAL_TITLE}
        closeText={MODAL_BUTTON_TEXT}
        renderHeaderCloseButton={false}
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
