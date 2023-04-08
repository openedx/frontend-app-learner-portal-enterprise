import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StatefulButton } from '@edx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import {
  useRedemptionMutation,
  useTransactionStatus,
} from './data';

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const StatefulEnroll = ({
  contentKey,
  labels,
  variant,
}) => {
  const [enrollButtonState, setEnrollButtonState] = useState('default');
  const [transactionUUID, setTransactionUUID] = useState();

  const buttonLabels = {
    default: 'Enroll',
    pending: 'Enrolling...',
    complete: 'Enrolled',
    error: 'Try again',
    // overrides default labels with any provided custom labels
    ...labels,
  };

  const redemptionMutation = useRedemptionMutation({
    onMutate: () => {
      setEnrollButtonState('pending');
    },
    onSuccess: (transaction) => {
      setTransactionUUID(transaction.uuid);
    },
    onError: () => {
      setEnrollButtonState('error');
    },
  });

  useTransactionStatus({
    transactionUUID,
    onSuccess: (transaction) => {
      setEnrollButtonState('complete');
      const coursewareURL = transaction.coursewareRedirectUrl;
      // eslint-disable-next-line no-console
      console.log(`[EMET] Successfully enrolled. Redirecting to courseware URL (${coursewareURL})!`);
      // window.location.href = coursewareURL;
      setTimeout(() => {
        setEnrollButtonState('default');
      }, 5000);
    },
  });

  const handleEnrollButtonClick = () => {
    redemptionMutation.mutate({
      userId: getAuthenticatedUser().id,
      contentKey,
    });
  };

  return (
    <StatefulButton
      labels={buttonLabels}
      variant={variant}
      state={enrollButtonState}
      onClick={handleEnrollButtonClick}
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
};

StatefulEnroll.defaultProps = {
  variant: 'primary',
  labels: {},
};

export default StatefulEnroll;
