import { useState } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { Button, AlertModal } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
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
      title={(
        <FormattedMessage
          id="learner.portal.integration.warning.modal.title"
          defaultMessage="edX Dashboard"
          description="Title for the integration warning modal"
        />
      )}
      isOpen={dismissed}
      onClose={handleModalOnClose}
      footerNode={(
        <Button
          variant="primary"
          onClick={handleButtonClick}
        >
          <FormattedMessage
            id="learner.portal.integration.warning.modal.button"
            defaultMessage="OK"
            description="Button text for dismissing the integration warning modal"
          />
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
