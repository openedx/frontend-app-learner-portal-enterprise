/* eslint-disable no-console */
import { useMutation } from '@tanstack/react-query';

import submitRedemptionRequest from '../submitRedemptionRequest';

const useRedemptionMutation = (options = {}) => {
  const createRedemption = async ({ userId, contentKey }) => {
    console.log(`[EMET] Sending redemption request for lms_user_id ${userId} and content ${contentKey}...`);
    const response = await submitRedemptionRequest();
    console.log(`[EMET] Finished redemption request for lms_user_id ${userId} and content ${contentKey}!`);
    return response;
  };

  const redemptionMutation = useMutation({
    mutationFn: createRedemption,
    ...options,
  });

  return redemptionMutation;
};

export default useRedemptionMutation;
