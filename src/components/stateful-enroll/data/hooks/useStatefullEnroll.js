import { useState } from 'react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import useRedemptionMutation from './useRedemptionMutation';
import useTransactionStatus from './useTransactionStatus';

const useStatefullEnroll = ({
  contentKey,
  subsidyAccessPolicy,
}) => {
  const [transaction, setTransaction] = useState();

  const handleRedemptionError = () => {
    // if (onError) {
    //   onError();
    // }
  };

  const redemptionMutation = useRedemptionMutation({
    onMutate: () => {
      // onMutate();
    },
    onSuccess: (newTransaction) => {
      setTransaction(newTransaction);
    },
    onError: () => {
      handleRedemptionError();
    },
  });

  const {
    refetch: refetchTransactionStatus,
  } = useTransactionStatus({
    contentKey,
    transaction,
    onSuccess: (newTransaction) => {
      if (newTransaction.state === 'committed') {
        if (onSuccess) {
          onSuccess(newTransaction);
        }
      }
      if (newTransaction.state === 'failed') {
        handleRedemptionError();
      }
    },
    onError: () => {
      handleRedemptionError();
    },
  });

  const mutationArgs = {
    userId: getAuthenticatedUser().id,
    contentKey,
    policyRedemptionUrl: subsidyAccessPolicy.policyRedemptionUrl,
  };

  return {
    mutate: ({ onSubmit, ...opts }) => {
      redemptionMutation.mutate(mutationArgs, {
        onSuccess: (newTransaction) => {
          if (onSuccess) {
            onSuccess(newTransaction);
          }
        },
        ...opts,
      });
    },
    mutateAsync: async ({ onSubmit, ...opts }) => {
      await redemptionMutation.mutateAsync(mutationArgs, {
        onSuccess: async (newTransaction) => {
          
        },
        ...opts,
      });
    },
  };
};

export default useStatefullEnroll;
