import React from 'react';
import PropTypes from 'prop-types';
import { useIntl, defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  enrollSuccessHelperText: {
    id: 'useCourseRunCardAction.enroll.success.helperText',
    defaultMessage: 'You were successfully enrolled. Redirecting to the course.',
    description: 'Helper text providing additional context for button label when enrollment was successful.',
  },
  enrollErrorHelperText: {
    id: 'useCourseRunCardAction.enroll.error.helperText',
    defaultMessage: 'An error occurred while processing your enrollment.',
    description: 'Helper text providing additional context for button label when enrollment was not successful.',
  },
  upgradeSuccessHelperText: {
    id: 'useCourseRunCardAction.upgrade.success.helperText',
    defaultMessage: 'Your enrollment was upgraded. Redirecting to the course.',
    description: 'Helper text providing additional context for button label when upgrading enrollment was successful.',
  },
  upgradeErrorHelperText: {
    id: 'useCourseRunCardAction.upgrade.error.helperText',
    defaultMessage: 'An error occurred while upgrading your enrollment.',
    description: 'Helper text providing additional context for button label when upgrading enrollment was not successful.',
  },
});

const RedemptionStatusText = ({
  hasRedemptionSuccess,
  hasRedemptionError,
  isUpgrading,
}) => {
  const intl = useIntl();

  const successText = isUpgrading ? intl.formatMessage(messages.upgradeSuccessHelperText)
    : intl.formatMessage(messages.enrollSuccessHelperText);

  const errorText = isUpgrading ? intl.formatMessage(messages.upgradeErrorHelperText)
    : intl.formatMessage(messages.enrollErrorHelperText);

  return (
    <div className="course__course-header__redemption-status-text">
      {hasRedemptionSuccess && (
        <div className="small text-gray">{successText}</div>
      )}
      {hasRedemptionError && (
        <div className="small text-danger">{errorText}</div>
      )}
    </div>
  );
};

RedemptionStatusText.propTypes = {
  hasRedemptionSuccess: PropTypes.bool.isRequired,
  hasRedemptionError: PropTypes.bool.isRequired,
  isUpgrading: PropTypes.bool,
};

RedemptionStatusText.defaultProps = {
  isUpgrading: false,
};

export default RedemptionStatusText;
