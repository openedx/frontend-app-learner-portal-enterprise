import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Alert, StatefulButton, ActionRow, Button, StandardModal,
} from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { updateEmailSettings } from './data';

const EmailSettingsModal = ({
  onClose,
  courseRunId,
  hasEmailsEnabled: initialEmailsEnabled,
  open,
}) => {
  const [hasEmailsEnabled, setHasEmailsEnabled] = useState(initialEmailsEnabled);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [hasSavedForm, setHasSavedForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setHasEmailsEnabled(initialEmailsEnabled);
      setIsFormChanged(false);
      setHasSavedForm(false);
    }
  }, [initialEmailsEnabled, open]);

  const getButtonState = () => {
    if (isSubmitting) {
      return 'pending';
    }
    if (isSuccessful) {
      return 'complete';
    }
    return 'default';
  };

  const getDisabledStates = () => (isFormChanged ? ['pending', 'complete'] : ['pending', 'complete', 'default']);

  const handleSaveButtonClick = async () => {
    setIsSubmitting(true);
    try {
      await updateEmailSettings(courseRunId, hasEmailsEnabled);
      setIsSuccessful(true);
      setIsFormChanged(false);
      setHasSavedForm(true);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnClose = () => {
    setIsSubmitting(false);
    setIsSuccessful(false);
    setIsFormChanged(false);
    setHasSavedForm(false);
    setError(null);
    onClose(hasSavedForm ? hasEmailsEnabled : undefined);
  };

  const handleEmailSettingsChange = (e) => {
    const isChecked = e.target.checked;
    setIsSuccessful(false);
    setHasSavedForm(false);
    setIsFormChanged(isChecked !== initialEmailsEnabled);
    setHasEmailsEnabled(isChecked);
  };

  return (
    <StandardModal
      title="Email settings"
      isOpen={open}
      onClose={handleOnClose}
      hasCloseButton
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={handleOnClose} data-testid="email-setting-modal-close-btn">Close</Button>
          <StatefulButton
            labels={{ default: 'Save', pending: 'Saving', complete: 'Saved' }}
            disabledStates={getDisabledStates()}
            state={getButtonState()}
            onClick={handleSaveButtonClick}
          />
        </ActionRow>
      )}
      isOverflowVisible={false}
      isFullscreenOnMobile
    >
      {error && (
        <Alert variant="danger" icon={Error}>
          An error occurred while saving your email settings. Please try again.
        </Alert>
      )}
      <Form.Group>
        <Form.Checkbox
          checked={hasEmailsEnabled}
          disabled={isSubmitting}
          onChange={handleEmailSettingsChange}
          className="email-checkbox"
        >
          Receive course emails such as reminders, schedule updates, and other critical announcements.
        </Form.Checkbox>
      </Form.Group>
    </StandardModal>
  );
};

EmailSettingsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  courseRunId: PropTypes.string.isRequired,
  hasEmailsEnabled: PropTypes.bool,
  open: PropTypes.bool,
};

EmailSettingsModal.defaultProps = {
  hasEmailsEnabled: false,
  open: false,
};

export default EmailSettingsModal;
