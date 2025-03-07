import { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Alert, StatefulButton, ActionRow, Button, StandardModal,
} from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

import { updateEmailSettings } from './data';

class EmailSettingsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasEmailsEnabled: false,
      isSubmitting: false,
      isSuccessful: false,
      isFormChanged: false,
      hasSavedForm: false,
      error: null,
    };
  }

  componentDidUpdate(prevProps) {
    const { hasEmailsEnabled } = this.props;

    if (hasEmailsEnabled !== prevProps.hasEmailsEnabled) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        hasEmailsEnabled,
      });
    }
  }

  getButtonState = () => {
    const { isSubmitting, isSuccessful } = this.state;
    if (isSubmitting) {
      return 'pending';
    }
    if (isSuccessful) {
      return 'complete';
    }

    return 'default';
  };

  getDisabledStates = () => {
    const { isFormChanged } = this.state;
    if (isFormChanged) {
      return ['pending', 'complete'];
    }
    return ['pending', 'complete', 'default'];
  };

  handleSaveButtonClick = () => {
    const { hasEmailsEnabled } = this.state;
    const { courseRunId } = this.props; // eslint-disable-line no-shadow
    this.setState({
      isSubmitting: true,
    }, async () => {
      try {
        await updateEmailSettings(courseRunId, hasEmailsEnabled);
        this.setState({
          isSuccessful: true,
          isSubmitting: false,
          isFormChanged: false,
          hasSavedForm: true,
          error: null,
        });
      } catch (error) {
        this.setState({
          isSubmitting: false,
          isFormChanged: false,
          error,
        });
      }
    });
  };

  handleOnClose = () => {
    const { hasEmailsEnabled, hasSavedForm } = this.state;
    const { onClose } = this.props;
    this.setState({
      isSubmitting: false,
      isSuccessful: false,
      isFormChanged: false,
      hasSavedForm: false,
      error: null,
    });
    if (hasSavedForm) {
      onClose(hasEmailsEnabled);
    } else {
      onClose();
    }
  };

  handleEmailSettingsChange = (e) => {
    const { hasEmailsEnabled } = this.state;
    const isChecked = e.target.checked;
    this.setState({
      isSuccessful: false,
      hasSavedForm: false,
      isFormChanged: isChecked !== hasEmailsEnabled,
      hasEmailsEnabled: isChecked,
    });
  };

  render() {
    const {
      error, hasEmailsEnabled, isSubmitting,
    } = this.state;
    const { open } = this.props;

    return (
      <StandardModal
        title="Email settings"
        isOpen={open}
        onClose={this.handleOnClose}
        hasCloseButton
        isFullscreenOnMobile
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={this.handleOnClose} data-testid="email-setting-modal-close-btn">Close</Button>
            <StatefulButton
              labels={{
                default: 'Save',
                pending: 'Saving',
                complete: 'Saved',
              }}
              disabledStates={this.getDisabledStates()}
              state={this.getButtonState()}
              onClick={this.handleSaveButtonClick}
            />
          </ActionRow>
        )}
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
            onChange={this.handleEmailSettingsChange}
            className="email-checkbox"
          >
            Receive course emails such as reminders, schedule updates, and other critical announcements.
          </Form.Checkbox>
        </Form.Group>
      </StandardModal>
    );
  }
}

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

export { EmailSettingsModal };

export default EmailSettingsModal;
