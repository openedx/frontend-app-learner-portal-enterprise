/* eslint-disable no-console */
import { useQuery } from '@tanstack/react-query';

import retrieveTransactionStatus from '../retrieveTransactionStatus';

const useTransactionStatus = ({
  transactionUUID,
  onSuccess,
}) => {
  const checkTransactionStatus = async () => {
    console.log(`[EMET] Sending transaction status request for transaction ${transactionUUID}...`);
    const response = await retrieveTransactionStatus(transactionUUID);
    console.log(`[EMET] Finished transaction status request for transaction ${transactionUUID}!`);
    return response;
  };

  const shouldPollTransactionState = (responseData) => {
    const transactionState = responseData?.state;
    return transactionState === 'pending';
  };

  const {
    isLoading,
    isError,
    data,
    error,
  } = useQuery({
    queryKey: ['transaction-status', transactionUUID],
    enabled: !!transactionUUID,
    refetchOnWindowFocus: false,
    queryFn: checkTransactionStatus,
    refetchInterval: (responseData) => (shouldPollTransactionState(responseData) ? 1000 : false),
    onSuccess,
  });

  return {
    isLoading,
    isError,
    data,
    error,
  };
};

export default useTransactionStatus;
