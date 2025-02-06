import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { useOptimizelyEnrollmentClickHandler, useTrackSearchConversionClickHandler } from '../../../course/data/hooks';
import { EVENT_NAMES } from '../../../course/data/constants';
import { queryPolicyTransaction, useEnterpriseCustomer } from '../../../app/data';

import { submitRedemptionRequest } from '../service';

interface BaseArgs {
  contentKey: string;
  subsidyAccessPolicy: Types.SubsidyAccessPolicy;
  onBeginRedeem?: () => void;
  onSuccess: (transaction: Types.SubsidyTransaction) => void;
  onError: (error: unknown) => void;
}

interface UseStatefulEnrollArgs extends BaseArgs {
  userEnrollments: Types.EnterpriseCourseEnrollment[];
}

interface UseRedemptionArgs extends BaseArgs {
  resetTransaction: () => void;
}

interface UseTransactionStatusArgs {
  transaction?: Types.SubsidyTransaction;
  onSuccess: (transaction: Types.SubsidyTransaction) => void;
  onError: (error: unknown) => void;
}

/**
 * Returns whether the transaction state should be polled.
 */
const shouldPollTransactionState = (transaction?: Types.SubsidyTransaction) => {
  const transactionState = transaction?.state;
  return transactionState === 'pending';
};

/**
 * Returns the refetch (polling) interval for the transaction query.
 */
const getRefetchInterval = (transaction?: Types.SubsidyTransaction) => {
  if (shouldPollTransactionState(transaction)) {
    return 1000;
  }
  return false;
};

/**
 * Custom hook to handle the redemption of a subsidy access policy. Returns
 * a function to redeem the given policy.
 */
const useRedemption = ({
  contentKey,
  subsidyAccessPolicy,
  onBeginRedeem,
  onSuccess,
  onError,
  resetTransaction,
}: UseRedemptionArgs) => {
  const { authenticatedUser }: Types.AppContextValue = useContext(AppContext);
  const redemptionMutation = useMutation({
    mutationFn: submitRedemptionRequest,
    onMutate: () => {
      if (onBeginRedeem) {
        onBeginRedeem();
      }
      resetTransaction();
    },
  });

  return useCallback(({ metadata } = {}) => {
    if (!subsidyAccessPolicy) {
      logError('`redeem` was called but no subsidy access policy was given.');
      return;
    }
    const makeRedemption = async () => {
      try {
        await redemptionMutation.mutateAsync({
          userId: authenticatedUser.userId,
          contentKey,
          policyRedemptionUrl: subsidyAccessPolicy.policyRedemptionUrl,
          metadata,
        }, {
          onSuccess,
          onError,
        });
      } catch (error) {
        onError(error);
      }
    };
    makeRedemption();
  }, [
    authenticatedUser.userId,
    contentKey,
    redemptionMutation,
    subsidyAccessPolicy,
    onSuccess,
    onError,
  ]);
};

/**
 * Custom hook to handle the status of a subsidy transaction. This hook will
 * poll the transaction status until it is no longer pending.
 */
const useTransactionStatus = ({
  transaction,
  onSuccess,
  onError,
}: UseTransactionStatusArgs) => {
  const enterpriseCustomerQuery = useEnterpriseCustomer();
  const enterpriseCustomer = enterpriseCustomerQuery.data!;
  const {
    data: updatedTransaction,
    isSuccess: isTransactionQuerySuccess,
    error: transactionQueryError,
  } = useQuery({
    ...queryPolicyTransaction(enterpriseCustomer.uuid, transaction),
    enabled: shouldPollTransactionState(transaction),
    refetchInterval: getRefetchInterval,
  });

  useEffect(() => {
    if (isTransactionQuerySuccess) {
      onSuccess(updatedTransaction);
    }
  }, [updatedTransaction, isTransactionQuerySuccess, onSuccess]);

  useEffect(() => {
    if (transactionQueryError) {
      onError(transactionQueryError);
    }
  }, [transactionQueryError, onError]);
};

/**
 * Custom hook to handle the enrollment of a user into a course, through the
 * redemption of a subsidy access policy.
 */
const useStatefulEnroll = ({
  contentKey,
  subsidyAccessPolicy,
  onSuccess,
  onError,
  onBeginRedeem,
  userEnrollments,
}: UseStatefulEnrollArgs) => {
  const [transaction, setTransaction] = useState<Types.SubsidyTransaction>();

  // Analytics handlers
  const optimizelyHandler = useOptimizelyEnrollmentClickHandler({
    courseRunKey: contentKey,
    userEnrollments,
  });
  const searchHandler = useTrackSearchConversionClickHandler({
    eventName: EVENT_NAMES.sucessfulEnrollment,
  });

  // Handle success for both redemption AND transaction status
  const handleSuccess = useCallback(async (newTransaction: Types.SubsidyTransaction) => {
    setTransaction(newTransaction);
    if (newTransaction.state === 'committed') {
      if (onSuccess) {
        optimizelyHandler();
        searchHandler();
        await onSuccess(newTransaction);
      }
    }
  }, [onSuccess, optimizelyHandler, searchHandler]);

  // Handle errors for both redemption AND transaction status
  const handleError = useCallback((error) => {
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Handle transaction status
  useTransactionStatus({
    transaction,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  // Return the redemption function
  return useRedemption({
    contentKey,
    subsidyAccessPolicy,
    onBeginRedeem,
    onSuccess: handleSuccess,
    onError: handleError,
    resetTransaction: () => setTransaction(undefined),
  });
};

export default useStatefulEnroll;
