import { useQuery } from '@tanstack/react-query';

import { retrieveTransactionStatus } from '../service';

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const useTransactionStatus = ({
  transactionUUID,
  onSuccess,
  onError,
}) => {
  const shouldPollTransactionState = (responseData) => {
    const transactionState = responseData?.state;
    return transactionState === 'pending';
  };

  const getRefetchInterval = (responseData) => {
    if (shouldPollTransactionState(responseData)) {
      return 1000;
    }
    return false;
  };

  const checkTransactionStatus = async () => {
    console.log('[checkTransactionStatus] transaction:', transactionUUID);
    const response = await retrieveTransactionStatus(transactionUUID);
    console.log('[checkTransactionStatus] response:', response);
    return response;
  };

  return useQuery({
    queryKey: ['transaction-status', transactionUUID],
    enabled: !!transactionUUID,
    refetchOnWindowFocus: false,
    queryFn: checkTransactionStatus,
    refetchInterval: getRefetchInterval,
    onSuccess,
    onError,
  });
};

export default useTransactionStatus;
