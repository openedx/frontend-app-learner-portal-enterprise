import { useQuery } from '@tanstack/react-query';

import { retrieveTransactionStatus } from '../service';

/**
 * Performs a query to retrieve the status of the specified transaction. If the
 * transaction is in a "pending" state, the API will be polled until the transaction
 * is in a "committed" or "failed" state.
 *
 * @param {object} args
 * @param {string} contentKey The content key (course run key) associated with the
 *  transaction. Temporary for mock API response.
 * @param {string} transactionUUID The transaction UUID to check the status of.
 * @param {function} onSuccess A callback function called when the transaction request is successful.
 * @param {function} onError A callback function called when the transaction request throws an error.
 * @returns
 */
const useTransactionStatus = ({
  contentKey,
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
    const response = await retrieveTransactionStatus({ transactionUUID, contentKey });
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
