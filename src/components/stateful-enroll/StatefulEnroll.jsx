import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StatefulButton } from '@edx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

import {
  useRedemptionMutation,
  useTransactionStatus,
} from './data';

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
  const [enrollButtonState, setEnrollButtonState] = useState('default');
  const [transactionStatusApiUrl, setTransactionStatusApiUrl] = useState();

  const buttonLabels = {
    default: intl.formatMessage(messages.buttonLabelEnroll),
    pending: intl.formatMessage(messages.buttonLabelEnrolling),
    complete: intl.formatMessage(messages.buttonLabelEnrolled),
    error: intl.formatMessage(messages.buttonLabelTryAgain),
    // overrides default labels with any provided custom labels
    ...labels,
  };

  const handleRedemptionError = () => {
    setEnrollButtonState('error');
    if (onError) {
      onError();
    }
  };

  const redemptionMutation = useRedemptionMutation({
    onMutate: () => {
      setEnrollButtonState('pending');
    },
    onSuccess: (transaction) => {
      setTransactionStatusApiUrl(transaction.transactionStatusApiUrl);
    },
    onError: () => {
      handleRedemptionError();
    },
  });

  useTransactionStatus({
    contentKey,
    transactionStatusApiUrl,
    onSuccess: (transaction) => {
      if (transaction.state === 'committed') {
        setEnrollButtonState('complete');
        if (onSuccess) {
          onSuccess(transaction);
        }
      }
      if (transaction.state === 'failed') {
        handleRedemptionError();
      }
    },
    onError: () => {
      handleRedemptionError();
    },
  });

  const handleEnrollButtonClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    redemptionMutation.mutate({
      userId: getAuthenticatedUser().id,
      contentKey,
      policyRedemptionUrl: subsidyAccessPolicy.policyRedemptionUrl,
    });
  };

  return (
    <StatefulButton
      labels={buttonLabels}
      variant={variant}
      state={enrollButtonState}
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
