import { useState } from 'react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useMutation, useQuery } from '@tanstack/react-query';

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
  const transaction = queryKey[1];
  const { transactionStatusApiUrl } = transaction;
  return retrieveTransactionStatus({ transactionStatusApiUrl });
};

const useStatefullEnroll = ({
  contentKey,
  subsidyAccessPolicy,
  onSuccess,
  onError,
  onRedeem,
}) => {
  const [transaction, setTransaction] = useState();

  const redemptionMutation = useMutation({
    mutationFn: submitRedemptionRequest,
    onMutate: () => {
      if (onRedeem) {
        onRedeem();
      }
      setTransaction(undefined);
    },
  });

  const handleSuccess = async (newTransaction) => {
    setTransaction(newTransaction);
    if (newTransaction.state === 'committed') {
      if (onSuccess) {
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

export default useStatefullEnroll;
