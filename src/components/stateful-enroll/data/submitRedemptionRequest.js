import { camelCaseObject } from '@edx/frontend-platform';
import { v4 as uuidv4 } from 'uuid';

const submitRedemptionRequest = async () => {
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

export default submitRedemptionRequest;
