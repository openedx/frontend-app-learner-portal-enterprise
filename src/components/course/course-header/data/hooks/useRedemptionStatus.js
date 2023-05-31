import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Acts as a state machine for the redemption status, with side effects for
 * invalidating query cache and redirecting to courseware upon successful redemption.
 *
 * @returns An object containing the redemption status, and functions to mutate the redemption status.
 */
const useRedemptionStatus = () => {
  const queryClient = useQueryClient();
  const [redemptionStatus, setRedemptionStatus] = useState();

  const handleRedeemClick = () => {
    setRedemptionStatus(undefined);
  };

  const handleRedeemSuccess = (transaction) => {
    queryClient.invalidateQueries({ queryKey: ['policy'] });
    setRedemptionStatus('success');

    // redirect to courseware
    const { coursewareUrl } = transaction;
    global.location.assign(coursewareUrl);
  };

  const handleRedeemError = () => {
    setRedemptionStatus('error');
  };

  return {
    redemptionStatus,
    handleRedeemClick,
    handleRedeemSuccess,
    handleRedeemError,
  };
};

export default useRedemptionStatus;
