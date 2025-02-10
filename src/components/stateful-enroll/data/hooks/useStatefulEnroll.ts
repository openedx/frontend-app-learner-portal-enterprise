import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { logInfo, logError } from '@edx/frontend-platform/logging';
import { useOptimizelyEnrollmentClickHandler, useTrackSearchConversionClickHandler } from '../../../course/data/hooks';
import { EVENT_NAMES } from '../../../course/data/constants';
import { queryPolicyTransaction, useEnterpriseCustomer } from '../../../app/data';

import { submitRedemptionRequest } from '../service';

interface BaseArgs {
  contentKey: string;
  subsidyAccessPolicy?: Types.SubsidyAccessPolicy;
  onBeginRedeem?: () => void;
  onSuccess: (transaction: Types.SubsidyTransaction) => void;
  onError: (error: Error) => void;
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
  onError: (error: Error) => void;
}

/**
 * Returns whether the transaction state should be polled (i.e., the transaction
 * is pending).
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
      logError(`Redemption without subsidy access policy attempted by ${authenticatedUser.userId} for ${contentKey}.`);
      return;
    }
    const makeRedemption = async () => {
      try {
        logInfo(`User ${authenticatedUser.userId} attempted to redeem ${contentKey} using subsidy access policy ${subsidyAccessPolicy.uuid}`);
        const transaction = await redemptionMutation.mutateAsync({
          userId: authenticatedUser.userId,
          contentKey,
          policyRedemptionUrl: subsidyAccessPolicy.policyRedemptionUrl,
          metadata,
        });
        await onSuccess(transaction);
      } catch (error) {
        await onError(error as Error);
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
  } = useQuery<Types.SubsidyTransaction, Error>({
    ...queryPolicyTransaction(enterpriseCustomer.uuid, transaction),
    enabled: shouldPollTransactionState(transaction),
    refetchInterval: getRefetchInterval,
  });

  // Handle transaction status updates
  useEffect(() => {
    if (!isTransactionQuerySuccess) {
      return;
    }
    if (updatedTransaction.state === 'failed') {
      const failedTransactionError = new Error(`Transaction ${updatedTransaction.uuid} failed during redemption.`);
      onError(failedTransactionError);
      return;
    }
    onSuccess(updatedTransaction);
  }, [updatedTransaction, isTransactionQuerySuccess, onSuccess, onError]);

  // Handle transaction query errors
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
  const { authenticatedUser }: Types.AppContextValue = useContext(AppContext);
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
      logInfo(`User ${newTransaction.lmsUserId} successfully redeemed ${newTransaction.contentKey} using subsidy access policy ${newTransaction.subsidyAccessPolicyUuid}.`);
      if (onSuccess) {
        optimizelyHandler();
        searchHandler();
        await onSuccess(newTransaction);
      }
    } else {
      logInfo(`User ${newTransaction.lmsUserId} successfully initiated redemption of ${newTransaction.contentKey} using subsidy access policy ${newTransaction.subsidyAccessPolicyUuid}. Current state: ${newTransaction.state}`);
    }
  }, [onSuccess, optimizelyHandler, searchHandler]);

  // Handle errors for both redemption AND transaction status
  const handleError = useCallback((error) => {
    logError(`Redemption failed for user ${authenticatedUser.userId} and ${contentKey} using subsidy access policy ${subsidyAccessPolicy?.uuid}: ${error}`);
    if (onError) {
      onError(error);
    }
  }, [onError, authenticatedUser.userId, contentKey, subsidyAccessPolicy?.uuid]);

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
