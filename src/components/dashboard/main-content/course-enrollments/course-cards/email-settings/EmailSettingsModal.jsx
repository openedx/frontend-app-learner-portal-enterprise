import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Alert, StatefulButton, ActionRow, Button, StandardModal,
} from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { FormattedMessage, defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { updateEmailSettings } from './data';

const messages = defineMessages({
  emailSettingsTitle: {
    id: 'learner.portal.email.settings.modal.title',
    defaultMessage: 'Email settings',
    description: 'Title for the email settings modal',
  },
  closeButton: {
    id: 'learner.portal.email.settings.modal.close.button',
    defaultMessage: 'Close',
    description: 'Text for the close button',
  },
  saveButtonDefault: {
    id: 'learner.portal.email.settings.modal.save.button.default',
    defaultMessage: 'Save',
    description: 'Default text for the save button',
  },
  saveButtonPending: {
    id: 'learner.portal.email.settings.modal.save.button.pending',
    defaultMessage: 'Saving',
    description: 'Text for the save button while saving',
  },
  saveButtonComplete: {
    id: 'learner.portal.email.settings.modal.save.button.complete',
    defaultMessage: 'Saved',
    description: 'Text for the save button after successful save',
  },
  errorMessage: {
    id: 'learner.portal.email.settings.modal.error.message',
    defaultMessage: 'An error occurred while saving your email settings. Please try again.',
    description: 'Error message shown when saving email settings fails',
  },
  checkboxLabel: {
    id: 'learner.portal.email.settings.modal.checkbox.label',
    defaultMessage: 'Receive course emails such as reminders, schedule updates, and other critical announcements.',
    description: 'Label for the email settings checkbox',
  },
});

const EmailSettingsModal = ({
  onClose,
  courseRunId,
  hasEmailsEnabled: initialEmailsEnabled,
  open,
}) => {
  const intl = useIntl();
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
      title={intl.formatMessage(messages.emailSettingsTitle)}
      isOpen={open}
      onClose={handleOnClose}
      hasCloseButton
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={handleOnClose} data-testid="email-setting-modal-close-btn">
            <FormattedMessage {...messages.closeButton} />
          </Button>
          <StatefulButton
            labels={{
              default: intl.formatMessage(messages.saveButtonDefault),
              pending: intl.formatMessage(messages.saveButtonPending),
              complete: intl.formatMessage(messages.saveButtonComplete),
            }}
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
          <FormattedMessage {...messages.errorMessage} />
        </Alert>
      )}
      <Form.Group>
        <Form.Checkbox
          checked={hasEmailsEnabled}
          disabled={isSubmitting}
          onChange={handleEmailSettingsChange}
          className="email-checkbox"
        >
          <FormattedMessage {...messages.checkboxLabel} />
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
