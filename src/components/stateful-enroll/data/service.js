import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';
import { v4 as uuidv4 } from 'uuid';

/**
 * TODO
 * @param {*} transactionUUID
 * @returns
 */
/* istanbul ignore next */
export const retrieveTransactionStatus = async (transactionUUID) => {
  const mockCommittedTransaction = {
    uuid: transactionUUID,
    state: 'committed',
    courseware_url: `${getConfig().LEARNING_BASE_URL}/course/course-v1:edX+S2023+1T2023/home`,
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
 * TODO
 * @returns
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
