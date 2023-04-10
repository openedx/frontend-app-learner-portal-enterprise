import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';

const retrieveTransactionStatus = async (transactionUUID) => {
  const sampleChoices = ['committed', 'pending', 'error'];
  const randomChoice = sampleChoices[Math.floor(Math.random() * sampleChoices.length)];

  const mockCommittedTransaction = {
    uuid: transactionUUID,
    state: randomChoice,
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

export default retrieveTransactionStatus;
