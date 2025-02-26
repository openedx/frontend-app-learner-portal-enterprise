import { useCallback, useContext, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { useOptimizelyEnrollmentClickHandler, useTrackSearchConversionClickHandler } from '../../../course/data/hooks';
import { EVENT_NAMES } from '../../../course/data/constants';
import { queryPolicyTransaction, useEnterpriseCustomer } from '../../../app/data';

import { submitRedemptionRequest } from '../service';

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

const useStatefulEnroll = ({
  contentKey,
  subsidyAccessPolicy,
  onSuccess,
  onError,
  onBeginRedeem,
  userEnrollments,
}) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const [transaction, setTransaction] = useState();
  const optimizelyHandler = useOptimizelyEnrollmentClickHandler({
    courseRunKey: contentKey,
    userEnrollments,
  });
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

  const handleSuccess = useCallback(async (newTransaction) => {
    setTransaction(newTransaction);
    if (newTransaction.state === 'committed') {
      if (onSuccess) {
        optimizelyHandler();
        searchHandler();
        await onSuccess(newTransaction);
      }
    }
  }, [onSuccess, optimizelyHandler, searchHandler]);

  const handleError = useCallback((error) => {
    if (onError) {
      onError(error);
    }
  }, [onError]);

  useQuery({
    ...queryPolicyTransaction(enterpriseCustomer.uuid, transaction),
    enabled: shouldPollTransactionState(transaction),
    refetchInterval: getRefetchInterval,
    // TODO: Remove the eslint-disable comment once the React Query v5 upgrade is complete
    /* eslint-disable @tanstack/query/no-deprecated-options */
    onSuccess: handleSuccess,
    onError: handleError,
    /* eslint-enable @tanstack/query/no-deprecated-options */
  });

  const redeem = useCallback(({ metadata } = {}) => {
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
          onSuccess: handleSuccess,
          onError: handleError,
        });
      } catch (error) {
        handleError(error);
      }
    };
    makeRedemption();
  }, [
    authenticatedUser.userId,
    contentKey,
    redemptionMutation,
    subsidyAccessPolicy,
    handleSuccess,
    handleError,
  ]);

  return {
    redeem,
  };
};

export default useStatefulEnroll;
