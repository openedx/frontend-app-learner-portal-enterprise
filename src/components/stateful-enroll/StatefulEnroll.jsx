import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StatefulButton } from '@edx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import {
  useRedemptionMutation,
  useTransactionStatus,
} from './data';

const StatefulEnroll = ({
  contentKey,
}) => {
  const [enrollButtonState, setEnrollButtonState] = useState('default');
  const [transactionUUID, setTransactionUUID] = useState();

  const enrollButtonLabels = {
    default: 'Enroll',
    pending: 'Enrolling...',
    complete: 'Enrolled',
    error: 'Try again',
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
      }, 2000);
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
      labels={enrollButtonLabels}
      state={enrollButtonState}
      onClick={handleEnrollButtonClick}
    />
  );
};

StatefulEnroll.propTypes = {
  contentKey: PropTypes.string.isRequired,
};

export default StatefulEnroll;
