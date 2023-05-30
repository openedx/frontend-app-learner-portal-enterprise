import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StatefulButton } from '@edx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

import { useStatefullEnroll } from './data';

const messages = defineMessages({
  buttonLabelEnroll: {
    id: 'StatefulEnroll.buttonLabel.enroll',
    defaultMessage: 'Enroll',
    description: 'Default label for enroll button.',
  },
  buttonLabelEnrolling: {
    id: 'StatefulEnroll.buttonLabel.enrolling',
    defaultMessage: 'Enrolling...',
    description: 'Label for enroll button when enrollment is processing.',
  },
  buttonLabelEnrolled: {
    id: 'StatefulEnroll.buttonLabel.enrolled',
    defaultMessage: 'Enrolled',
    description: 'Label for enroll button when enrollment is complete.',
  },
  buttonLabelTryAgain: {
    id: 'StatefulEnroll.buttonLabel.tryAgain',
    defaultMessage: 'Try again',
    description: 'Label for enroll button when enrollment errored.',
  },
});

/**
 * Handles asynchronous redemption of a subsidy access policy for a learner and course run key.
 *
 * When user clicks the button, an API call is made to redeem the subsidy access policy. It returns
 * the payload for the associated transaction, which is subsequently polled for completion or error.
 */
const StatefulEnroll = ({
  contentKey,
  subsidyAccessPolicy,
  labels,
  variant,
  onClick,
  onSuccess,
  onError,
  ...props
}) => {
  const intl = useIntl();
  const [buttonState, setButtonState] = useState('default');

  const buttonLabels = {
    default: intl.formatMessage(messages.buttonLabelEnroll),
    pending: intl.formatMessage(messages.buttonLabelEnrolling),
    complete: intl.formatMessage(messages.buttonLabelEnrolled),
    error: intl.formatMessage(messages.buttonLabelTryAgain),
    // overrides default labels with any provided custom labels
    ...labels,
  };

  const { redeem } = useStatefullEnroll({
    contentKey,
    subsidyAccessPolicy,
    onRedeem: () => {
      setButtonState('pending');
    },
    onSuccess: (transaction) => {
      console.log('onSuccess', transaction);
      setButtonState('complete');
      if (onSuccess) {
        onSuccess(transaction);
      }
    },
  });

  const handleEnrollButtonClick = () => {
    console.log('handleEnrollButtonClick', contentKey);
    if (onClick) {
      onClick();
    }
    redeem();
  };

  return (
    <StatefulButton
      labels={buttonLabels}
      variant={variant}
      state={buttonState}
      onClick={handleEnrollButtonClick}
      {...props}
    />
  );
};

StatefulEnroll.propTypes = {
  contentKey: PropTypes.string.isRequired,
  subsidyAccessPolicy: PropTypes.shape({
    policyRedemptionUrl: PropTypes.string.isRequired,
  }).isRequired,
  variant: PropTypes.string,
  labels: PropTypes.shape({
    default: PropTypes.string,
    pending: PropTypes.string,
    complete: PropTypes.string,
    error: PropTypes.string,
  }),
  onClick: PropTypes.func,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

StatefulEnroll.defaultProps = {
  variant: 'primary',
  labels: {},
  onClick: undefined,
  onSuccess: undefined,
  onError: undefined,
};

export default StatefulEnroll;
