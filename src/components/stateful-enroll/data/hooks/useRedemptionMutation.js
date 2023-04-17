import { useMutation } from '@tanstack/react-query';

import submitRedemptionRequest from '../submitRedemptionRequest';

export const createRedemption = async ({ userId, contentKey }) => {
  const response = await submitRedemptionRequest({
    userId,
    contentKey,
  });
  return response;
};

const useRedemptionMutation = (options = {}) => useMutation({
  mutationFn: createRedemption,
  ...options,
});

export default useRedemptionMutation;
