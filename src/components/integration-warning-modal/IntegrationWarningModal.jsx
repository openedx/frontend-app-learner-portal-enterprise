import { useState } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { Button, AlertModal } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { MODAL_BUTTON_TEXT, MODAL_TITLE } from './data/constants';
import ModalBody from './ModalBody';

const IntegrationWarningModal = ({
  isEnabled,
}) => {
  const config = getConfig();
  const cookies = new Cookies();
  const isWarningDismissed = () => {
    const isDismissed = cookies.get(config.INTEGRATION_WARNING_DISMISSED_COOKIE_NAME);
    return !!isDismissed;
  };
  const [dismissed, setState] = useState(isEnabled && !isWarningDismissed());

  const handleModalOnClose = () => {
    cookies.set(config.INTEGRATION_WARNING_DISMISSED_COOKIE_NAME, true, { path: '/' });
  };

  const handleButtonClick = () => {
    handleModalOnClose();
    setState(false);
  };

  return (
    <AlertModal
      title={MODAL_TITLE}
      isOpen={dismissed}
      onClose={handleModalOnClose}
      isOverflowVisible={false}
      footerNode={(
        <Button
          variant="primary"
          onClick={handleButtonClick}
        >
          {MODAL_BUTTON_TEXT}
        </Button>
      )}
      isOverflowVisible={false}
    >
      <ModalBody />
    </AlertModal>
  );
};

IntegrationWarningModal.propTypes = {
  isEnabled: PropTypes.bool,
};

IntegrationWarningModal.defaultProps = {
  isEnabled: false,
};

export default IntegrationWarningModal;
