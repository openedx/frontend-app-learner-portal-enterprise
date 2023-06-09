import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { useTrackSearchConversionClickHandler, useOptimizelyEnrollmentClickHandler } from '../../../course/data/hooks';
import { EVENT_NAMES } from '../../../course/enrollment/constants';

import {
  submitRedemptionRequest,
  retrieveTransactionStatus,
} from '../service';

const shouldPollTransactionState = (response) => {
  const transactionState = response?.state;
  return transactionState === 'pending';
};

const getRefetchInterval = (response) => {
  if (shouldPollTransactionState(response)) {
    return 1000;
  }
  return false;
};

const checkTransactionStatus = async ({ queryKey }) => {
  const transaction = queryKey[2];
  const { transactionStatusApiUrl } = transaction;
  return retrieveTransactionStatus({ transactionStatusApiUrl });
};

const useStatefulEnroll = ({
  contentKey,
  subsidyAccessPolicy,
  onSuccess,
  onError,
  onBeginRedeem,
  courseEnrollmentsByStatus,
}) => {
  const [transaction, setTransaction] = useState();
  const optimizelyHandler = useOptimizelyEnrollmentClickHandler(
    contentKey,
    courseEnrollmentsByStatus,
  );
  const searchHandler = useTrackSearchConversionClickHandler({
    eventName: EVENT_NAMES.clickedToEnrollPage,
  });
  const redemptionMutation = useMutation({
    mutationFn: submitRedemptionRequest,
    onMutate: () => {
      if (onBeginRedeem) {
        onBeginRedeem();
      }
      setTransaction(undefined);
    },
  });

  const handleSuccess = async (newTransaction) => {
    setTransaction(newTransaction);
    if (newTransaction.state === 'committed') {
      if (onSuccess) {
        optimizelyHandler();
        searchHandler();
        await onSuccess(newTransaction);
      }
    }
  };

  const handleError = (error) => {
    if (onError) {
      onError(error);
    }
  };

  useQuery({
    queryKey: ['policy', 'transactions', transaction],
    enabled: shouldPollTransactionState(transaction),
    queryFn: checkTransactionStatus,
    refetchInterval: getRefetchInterval,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const redeem = ({ metadata } = {}) => {
    if (!subsidyAccessPolicy) {
      logError('`redeem` was called but no subsidy access policy was given.');
      return;
    }
    const makeRedemption = async () => {
      try {
        await redemptionMutation.mutateAsync({
          userId: getAuthenticatedUser().id,
          contentKey,
          policyRedemptionUrl: subsidyAccessPolicy.policyRedemptionUrl,
          metadata,
        }, {
          onSuccess: handleSuccess,
          onError: handleError,
        });
      } catch (error) {
        handleError(error);
      }
    };
    makeRedemption();
  };

  return {
    redeem,
  };
};

export default useStatefulEnroll;
