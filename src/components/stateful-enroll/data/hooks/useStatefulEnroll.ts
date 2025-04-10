import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { useOptimizelyEnrollmentClickHandler, useTrackSearchConversionClickHandler } from '../../../course/data/hooks';
import { EVENT_NAMES } from '../../../course/data/constants';
import { queryPolicyTransaction, useEnterpriseCustomer } from '../../../app/data';

import { submitRedemptionRequest } from '../service';

interface BaseArgs {
  contentKey: string;
  subsidyAccessPolicy?: SubsidyAccessPolicy;
  onBeginRedeem?: () => void;
  onSuccess: (transaction: SubsidyTransaction) => void;
  onError: (error: Error) => void;
}

interface UseStatefulEnrollArgs extends BaseArgs {
  userEnrollments: EnterpriseCourseEnrollment[];
}

interface UseRedemptionArgs extends BaseArgs {
  resetTransaction: () => void;
}

interface UseTransactionStatusArgs {
  transaction?: SubsidyTransaction;
  onSuccess: (transaction: SubsidyTransaction) => void;
  onError: (error: Error) => void;
}

interface RedeemFnArgs {
  metadata?: Record<string, unknown>;
}

/**
 * Returns whether the transaction state should be polled (i.e., the transaction
 * is pending).
 */
function shouldPollTransactionState(transaction?: SubsidyTransaction) {
  const transactionState = transaction?.state;
  return transactionState === 'pending';
}

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
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const redemptionMutation = useMutation({
    mutationFn: submitRedemptionRequest,
    onMutate: () => {
      if (onBeginRedeem) {
        onBeginRedeem();
      }
      resetTransaction();
    },
  });

  return useCallback(({ metadata }: RedeemFnArgs = {}) => {
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
  const enterpriseCustomerResult = useEnterpriseCustomer();
  const enterpriseCustomer = enterpriseCustomerResult.data as EnterpriseCustomer;
  const {
    data: updatedTransaction,
    isSuccess: isTransactionQuerySuccess,
    error: transactionQueryError,
  } = useQuery<SubsidyTransaction, Error>({
    ...queryPolicyTransaction(enterpriseCustomer.uuid, transaction?.transactionStatusApiUrl),
    enabled: !!transaction,
    refetchInterval: (query) => {
      if (shouldPollTransactionState(query.state.data)) {
        return 1000;
      }
      return false;
    },
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

const useStatefulEnroll = ({
  contentKey,
  subsidyAccessPolicy,
  onSuccess,
  onError,
  onBeginRedeem,
  userEnrollments,
}: UseStatefulEnrollArgs) => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const [transaction, setTransaction] = useState<SubsidyTransaction>();

  // Analytics handlers
  const optimizelyHandler = useOptimizelyEnrollmentClickHandler({
    courseRunKey: contentKey,
    userEnrollments,
  });
  const searchHandler = useTrackSearchConversionClickHandler({
    eventName: EVENT_NAMES.sucessfulEnrollment,
  });

  // Handle success for both redemption AND transaction status
  const handleSuccess = useCallback(async (newTransaction: SubsidyTransaction) => {
    if (newTransaction.state === 'committed') {
      logInfo(`User ${newTransaction.lmsUserId} successfully redeemed ${newTransaction.contentKey} using subsidy access policy ${newTransaction.subsidyAccessPolicyUuid}.`);
      if (onSuccess) {
        optimizelyHandler();
        searchHandler();
        await onSuccess(newTransaction);
      }
    } else {
      logInfo(`User ${newTransaction.lmsUserId} successfully initiated redemption of ${newTransaction.contentKey} using subsidy access policy ${newTransaction.subsidyAccessPolicyUuid}. Current state: ${newTransaction.state}`);
      setTransaction(newTransaction);
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
