import { useMutation } from '@tanstack/react-query';

import submitRedemptionRequest from '../submitRedemptionRequest';

const useRedemptionMutation = (options = {}) => {
  const createRedemption = async ({ userId, contentKey }) => {
    const response = await submitRedemptionRequest({
      userId,
      contentKey,
    });
    return response;
  };

  return useMutation({
    mutationFn: createRedemption,
    ...options,
  });
};

export default useRedemptionMutation;
