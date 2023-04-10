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
  redemptionStatus,
  isUpgrading,
}) => {
  const intl = useIntl();

  if (redemptionStatus === 'success') {
    const successText = isUpgrading ? intl.formatMessage(messages.upgradeSuccessHelperText)
      : intl.formatMessage(messages.enrollSuccessHelperText);
    return <div className="small text-gray">{successText}</div>;
  }

  if (redemptionStatus === 'error') {
    const errorText = isUpgrading ? intl.formatMessage(messages.upgradeErrorHelperText)
      : intl.formatMessage(messages.enrollErrorHelperText);
    return <div className="small text-danger">{errorText}</div>;
  }

  return null;
};

RedemptionStatusText.propTypes = {
  redemptionStatus: PropTypes.oneOf(['success', 'error']),
  isUpgrading: PropTypes.bool,
};

RedemptionStatusText.defaultProps = {
  redemptionStatus: undefined,
  isUpgrading: false,
};

export default RedemptionStatusText;
