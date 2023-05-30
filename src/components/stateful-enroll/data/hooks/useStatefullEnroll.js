import { useState } from 'react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  onRedeem,
}) => {
  const queryClient = useQueryClient();
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

  useQuery({
    queryKey: ['policy', 'transactions', transaction],
    enabled: shouldPollTransactionState(transaction),
    queryFn: checkTransactionStatus,
    refetchInterval: getRefetchInterval,
    onSuccess: async (newTransaction) => {
      if (newTransaction.state === 'committed') {
        if (onSuccess) {
          await onSuccess(newTransaction);
        }
      } else {
        setTransaction(newTransaction);
      }
    },
  });

  const redeem = () => {
    const makeRedemption = async () => {
      await redemptionMutation.mutateAsync({
        userId: getAuthenticatedUser().id,
        contentKey,
        policyRedemptionUrl: subsidyAccessPolicy.policyRedemptionUrl,
      }, {
        onSuccess: async (newTransaction) => {
          if (newTransaction.state === 'committed') {
            if (onSuccess) {
              await onSuccess(newTransaction);
            }
          } else {
            setTransaction(newTransaction);
          }
        },
        onError: (error) => {
          console.log('[useStatefulEnroll] error', error);
        },
      });
    };
    makeRedemption();
  };

  // const isLoading = (
  //   redemptionMutation.isLoading || transactionQuery.isLoading
  // );

  return {
    redeem,
    // isLoading,
    // redemptionMutation,
    // transactionQuery,
  };
};

export default useStatefullEnroll;
