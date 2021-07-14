import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Input, Modal, Alert, StatefulButton,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

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
  }

  getDisabledStates = () => {
    const { isFormChanged } = this.state;
    if (isFormChanged) {
      return ['pending', 'complete'];
    }
    return ['pending', 'complete', 'default'];
  }

  handleSaveButtonClick = () => {
    const { hasEmailsEnabled } = this.state;
    const { courseRunId, updateEmailSettings } = this.props; // eslint-disable-line no-shadow
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
    const { open, courseRunId } = this.props;

    return (
      <Modal
        title="Email settings"
        body={(
          <>
            {error && (
              <Alert variant="danger" icon={Error}>
                An error occurred while saving your email settings. Please try again.
              </Alert>
            )}
            <div className="form-check">
              <Input
                type="checkbox"
                id={`email-settings-${courseRunId}`}
                checked={hasEmailsEnabled}
                disabled={isSubmitting}
                onChange={this.handleEmailSettingsChange}
              />
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className="form-check-label ml-2 font-weight-normal" htmlFor={`email-settings-${courseRunId}`}>
                Receive course emails such as reminders, schedule updates, and
                other critical announcements.
              </label>
            </div>
          </>
        )}
        onClose={this.handleOnClose}
        buttons={[
          <StatefulButton
            labels={{
              default: 'Save',
              pending: 'Saving',
              complete: 'Saved',
            }}
            disabledStates={this.getDisabledStates()}
            className="save-email-settings-btn btn-primary btn-brand-primary"
            state={this.getButtonState()}
            onClick={this.handleSaveButtonClick}
            key="save-email-settings-btn"
          />,
        ]}
        open={open}
      />
    );
  }
}

EmailSettingsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  updateEmailSettings: PropTypes.func.isRequired,
  courseRunId: PropTypes.string.isRequired,
  hasEmailsEnabled: PropTypes.bool,
  open: PropTypes.bool,
};

EmailSettingsModal.defaultProps = {
  hasEmailsEnabled: false,
  open: false,
};

const mapDispatchToProps = dispatch => ({
  updateEmailSettings: (courseRunId, hasEmailsEnabled) => new Promise((resolve, reject) => {
    dispatch(updateEmailSettings({
      courseRunId,
      hasEmailsEnabled,
      onSuccess: (response) => { resolve(response); },
      onError: (error) => { reject(error); },
    }));
  }),
});

export { EmailSettingsModal };

export default connect(null, mapDispatchToProps)(EmailSettingsModal);
