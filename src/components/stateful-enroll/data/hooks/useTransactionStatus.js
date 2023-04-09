import { useQuery } from '@tanstack/react-query';

import retrieveTransactionStatus from '../retrieveTransactionStatus';

const useTransactionStatus = ({
  transactionUUID,
  onSuccess,
}) => {
  const checkTransactionStatus = async () => {
    const response = await retrieveTransactionStatus(transactionUUID);
    return response;
  };

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

  return useQuery({
    queryKey: ['transaction-status', transactionUUID],
    enabled: !!transactionUUID,
    refetchOnWindowFocus: false,
    queryFn: checkTransactionStatus,
    refetchInterval: getRefetchInterval,
    onSuccess,
  });
};

export default useTransactionStatus;
