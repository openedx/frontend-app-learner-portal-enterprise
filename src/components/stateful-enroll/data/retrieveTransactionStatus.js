import { camelCaseObject } from '@edx/frontend-platform';

const mockAccessPolicyRedemptionStatusApiResonses = {
  pendingTransaction: {
    uuid: 'b7aecc53-edc5-4bc3-abbc-21c25047d9e9',
    status: 'pending',
    courseware_redirect_url: null,
  },
  successfulTransaction: {
    uuid: 'b7aecc53-edc5-4bc3-abbc-21c25047d9e9',
    status: 'committed',
    courseware_redirect_url: 'http://localhost:18000/courses/course-v1:edX+S2023+1T2023/courseware/',
  },
};

const retrieveTransactionStatus = async (transactionUUID) => {
  const mockCommittedTransaction = {
    uuid: transactionUUID,
    state: 'committed',
    courseware_redirect_url: 'http://localhost:18000/courses/course-v1:edX+S2023+1T2023/courseware/',
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

export default retrieveTransactionStatus;
