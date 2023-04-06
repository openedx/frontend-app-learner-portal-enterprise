import { camelCaseObject } from '@edx/frontend-platform';

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
