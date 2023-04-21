import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';
import { v4 as uuidv4 } from 'uuid';

/**
 * Makes an API request to retrieve the most recent payload for the
 * specified transaction UUID.
 *
 * Note: this arg may change to be given the actual API url to call
 * rather than just the `transactionUUID` (TBD during API integration).
 *
 * @param {object} args
 * @param {string} args.contentKey
 * @param {string} args.transactionUUID
 * @returns The payload for the specified transaction.
 */
/* istanbul ignore next */
export const retrieveTransactionStatus = async ({ contentKey, transactionUUID }) => {
  const mockCommittedTransaction = {
    uuid: transactionUUID,
    state: 'committed',
    courseware_url: `${getConfig().LEARNING_BASE_URL}/course/${contentKey}/home`,
  };
  const url = 'https://httpbin.org/post';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mockCommittedTransaction),
  });
  const result = await response.json();
  return camelCaseObject(result.json);
};

/**
 * Makes an API request to submit a redemption request for the specified
 * user and course run key.
 *
 * @returns Payload from the redemption request.
 */
/* istanbul ignore next */
export const submitRedemptionRequest = async () => {
  const mockTransactionResponse = {
    uuid: uuidv4(),
  };
  const url = 'https://httpbin.org/post';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mockTransactionResponse),
  });
  const result = await response.json();
  return camelCaseObject(result.json);
};
