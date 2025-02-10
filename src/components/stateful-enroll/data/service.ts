import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

interface SubmitRedemptionRequestArgs {
  /* The URL to submit the redemption request to. */
  policyRedemptionUrl: string;
  /* The user ID of the user to submit the redemption request for. */
  userId: string;
  /* The content key (course run key) to submit the redemption request for. */
  contentKey: string;
  /* Optional metadata to include in the redemption request. */
  metadata?: Record<string, unknown>;
}

/**
 * Makes an API request to submit a redemption request for the specified
 * user and course run key.
 */
export const submitRedemptionRequest = async ({
  policyRedemptionUrl,
  userId,
  contentKey,
  metadata = {},
}: SubmitRedemptionRequestArgs): Promise<Types.SubsidyTransaction> => {
  const requestBody = {
    lms_user_id: userId,
    content_key: contentKey,
    metadata,
  };
  const { data } = await getAuthenticatedHttpClient().post(policyRedemptionUrl, requestBody);
  return camelCaseObject(data);
};
