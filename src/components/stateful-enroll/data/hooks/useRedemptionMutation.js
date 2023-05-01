import { useMutation } from '@tanstack/react-query';

import { submitRedemptionRequest } from '../service';

const createRedemption = async ({ userId, contentKey }) => {
  const response = await submitRedemptionRequest({
    userId,
    contentKey,
  });
  return response;
};

const useRedemptionMutation = (options) => useMutation({
  mutationFn: createRedemption,
  ...options,
});

export default useRedemptionMutation;
