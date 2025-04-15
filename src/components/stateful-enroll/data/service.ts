import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

type SubmitRedemptionRequestArgs = {
  policyRedemptionUrl: string;
  userId: number;
  contentKey: string;
  metadata?: Record<string, unknown>;
};

/**
 * Makes an API request to retrieve the most recent payload for the
 * specified transaction status API url.
 * @returns The response from calling the transaction statue API url
 */
export const retrieveTransactionStatus = async (
  { transactionStatusApiUrl }: SubsidyTransaction,
): Promise<SubsidyTransaction> => {
  const response = await getAuthenticatedHttpClient().get(transactionStatusApiUrl);
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
 * @param {Object} [args.metadata] Optional metadata to include in the redemption request.
 *
 * @returns Payload from the redemption request.
 */
export const submitRedemptionRequest = async ({
  policyRedemptionUrl,
  userId,
  contentKey,
  metadata = {},
}: SubmitRedemptionRequestArgs) => {
  const requestBody = {
    lms_user_id: userId,
    content_key: contentKey,
    metadata,
  };
  const { data } = await getAuthenticatedHttpClient().post(policyRedemptionUrl, requestBody);
  return camelCaseObject(data);
};
