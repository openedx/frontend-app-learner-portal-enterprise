import { useContext, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { useOptimizelyEnrollmentClickHandler, useTrackSearchConversionClickHandler } from '../../../course/data/hooks';
import { EVENT_NAMES } from '../../../course/data/constants';

import { retrieveTransactionStatus, submitRedemptionRequest } from '../service';
import { enterpriseUserSubsidyQueryKeys } from '../../../enterprise-user-subsidy/data/constants';

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
  const transaction = queryKey[3];
  const { transactionStatusApiUrl } = transaction;
  return retrieveTransactionStatus({ transactionStatusApiUrl });
};

const useStatefulEnroll = ({
  contentKey,
  subsidyAccessPolicy,
  onSuccess,
  onError,
  onBeginRedeem,
  userEnrollments,
}) => {
  const [transaction, setTransaction] = useState();
  const optimizelyHandler = useOptimizelyEnrollmentClickHandler(
    contentKey,
    userEnrollments,
  );
  const searchHandler = useTrackSearchConversionClickHandler({
    eventName: EVENT_NAMES.sucessfulEnrollment,
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
  const { authenticatedUser } = useContext(AppContext);

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
    queryKey: enterpriseUserSubsidyQueryKeys.pollPendingPolicyTransaction(transaction),
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
          userId: authenticatedUser.id,
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
