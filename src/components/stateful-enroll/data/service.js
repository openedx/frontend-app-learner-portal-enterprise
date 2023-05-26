import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

/**
 * Makes an API request to retrieve the most recent payload for the
 * specified transaction UUID.
 *
 * @param {object} args
 * @param {string} args.transaction Metadata about a transaction containing a uuid (primary
 *  key) of the subsidy from which transactions should be listed.
 * @returns The payload for the specified transaction.
 */
export const retrieveTransactionStatus = async ({ transaction }) => {
  const response = await getAuthenticatedHttpClient().get(transaction.transactionStatusApiUrl);
  return camelCaseObject(response.data);
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
};
