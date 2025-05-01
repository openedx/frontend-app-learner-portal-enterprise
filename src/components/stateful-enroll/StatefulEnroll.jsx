import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { StatefulButton } from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';

import { useStatefulEnroll } from './data';
import { useUserSubsidyApplicableToCourse } from '../course/data';
import { LEARNER_CREDIT_SUBSIDY_TYPE } from '../app/data';

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
  buttonLabelLoadingApplicableSubsidy: {
    id: 'StatefulEnroll.buttonLabel.loadingApplicableSubsidy',
    defaultMessage: 'Please wait...',
    description: 'Label for enroll button when loading applicable subsidy.',
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
  onClick,
  onSuccess,
  onError,
  options = {},
  labels = {},
  variant = 'primary',
  ...props
}) => {
  const intl = useIntl();
  const [buttonState, setButtonState] = useState('default');
  const {
    trackSearchConversionEventName,
  } = options;

  // Handle background re-fetches of `canRedeem`, which may trigger hard loading state due to the query key change
  // when the potentially redeemable course run keys are updated (e.g., if an admin cancels a learner's assignment
  // while the user is on the course page).
  const {
    isPending: isPendingApplicableSubsidy,
    userSubsidyApplicableToCourse,
  } = useUserSubsidyApplicableToCourse();

  useEffect(() => {
    if (isPendingApplicableSubsidy) {
      return;
    }
    if (userSubsidyApplicableToCourse?.subsidyType !== LEARNER_CREDIT_SUBSIDY_TYPE) {
      logError('StatefulEnroll component can only be used with learner credit subsidies.');
    }
  }, [isPendingApplicableSubsidy, userSubsidyApplicableToCourse]);

  useEffect(() => {
    if (isPendingApplicableSubsidy) {
      setButtonState('loadingApplicableSubsidy');
    } else {
      setButtonState('default');
    }
  }, [isPendingApplicableSubsidy]);

  const buttonLabels = {
    loadingApplicableSubsidy: intl.formatMessage(messages.buttonLabelLoadingApplicableSubsidy),
    default: intl.formatMessage(messages.buttonLabelEnroll),
    pending: intl.formatMessage(messages.buttonLabelEnrolling),
    complete: intl.formatMessage(messages.buttonLabelEnrolled),
    error: intl.formatMessage(messages.buttonLabelTryAgain),
    // overrides default labels with any provided custom labels
    ...labels,
  };
  const disabledButtonStates = ['loadingApplicableSubsidy', 'pending', 'complete'];

  const redeem = useStatefulEnroll({
    contentKey,
    subsidyAccessPolicy: userSubsidyApplicableToCourse,
    options: {
      trackSearchConversionEventName,
    },
    onBeginRedeem: () => {
      setButtonState('pending');
    },
    onSuccess: (transaction) => {
      setButtonState('complete');
      if (onSuccess) {
        onSuccess(transaction);
      }
    },
    onError: (error) => {
      setButtonState('error');
      if (onError) {
        onError(error);
      }
    },
  });

  const handleEnrollButtonClick = () => {
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
      disabledStates={disabledButtonStates}
      onClick={handleEnrollButtonClick}
      {...props}
    />
  );
};

StatefulEnroll.propTypes = {
  contentKey: PropTypes.string.isRequired,
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
  options: PropTypes.shape({
    trackSearchConversionEventName: PropTypes.string,
  }),
};

export default StatefulEnroll;
