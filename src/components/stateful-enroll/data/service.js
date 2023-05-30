import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

/**
 * Makes an API request to retrieve the most recent payload for the
 * specified transaction UUID.
 *
 * @param {object} args
 * @param {string} args.transactionStatusApiUrl API url to retrieve the transaction status.
 * @returns The payload for the specified transaction.
 */
export const retrieveTransactionStatus = async ({ transactionStatusApiUrl }) => {
  const response = await getAuthenticatedHttpClient().get(transactionStatusApiUrl);
  return camelCaseObject(response.data);

  // const requestBody = {
  //   transactionStatusApiUrl,
  //   state: Math.random() > 0.5 ? 'committed' : 'pending',
  //   // state: 'pending',
  //   uuid: Math.random(),
  //   coursewareUrl: 'http://localhost:2000/course/course-v1:edX+CTL.SC2x+1T2023a/home',
  // };
  // const response = await fetch('https://httpbin.org/post', {
  //   method: 'POST',
  //   body: JSON.stringify(requestBody),
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // });
  // const result = await response.json();
  // return camelCaseObject(result.json);
};

/**
 * Makes an API request to submit a redemption request for the specified
 * user and course run key.
 *
 * @param {object} args
 * @param {string} args.policyRedemptionUrl The URL to submit the redemption request to.
 * @param {string} args.userId The user ID of the user to submit the redemption request for.
 * @param {string} args.contentKey The content key (course run key) to submit the redemption request for.
 * @returns Payload from the redemption request.
 */
export const submitRedemptionRequest = async ({ policyRedemptionUrl, userId, contentKey }) => {
  const requestBody = {
    lms_user_id: userId,
    content_key: contentKey,
  };
  const { data } = await getAuthenticatedHttpClient().post(policyRedemptionUrl, requestBody);
  return camelCaseObject(data);

  // const requestBody = {
  //   lms_user_id: userId,
  //   content_key: contentKey,
  //   // deleteme
  //   uuid: Math.random(),
  //   state: 'pending',
  //   policyRedemptionUrl,
  //   coursewareUrl: 'http://localhost:2000/course/course-v1:edX+CTL.SC2x+1T2023a/home',
  // };
  // const data = await fetch('https://httpbin.org/post', {
  //   method: 'POST',
  //   body: JSON.stringify(requestBody),
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // });
  // const result = await data.json();
  // return camelCaseObject(result.json);
};
