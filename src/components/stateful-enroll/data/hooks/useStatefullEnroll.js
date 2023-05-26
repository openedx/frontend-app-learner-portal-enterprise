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

  useTransactionStatus({
    contentKey,
    transaction,
    onSuccess: (newTransaction) => {
      if (newTransaction.state === 'committed') {
        // if (onSuccess) {
        //   onSuccess(newTransaction);
        // }
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
    mutate: (opts) => {
      redemptionMutation.mutate(mutationArgs, { ...opts });
    },
    mutateAsync: async (opts) => {
      const mutation = await redemptionMutation.mutateAsync(mutationArgs, { ...opts });
      return mutation;
    },
  };
};

export default useStatefullEnroll;
