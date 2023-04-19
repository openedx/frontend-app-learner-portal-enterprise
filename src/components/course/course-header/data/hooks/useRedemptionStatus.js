import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * TODO
 * @returns
 */
const useRedemptionStatus = () => {
  const queryClient = useQueryClient();
  const [redemptionStatus, setRedemptionStatus] = useState();

  const handleRedeemClick = () => {
    setRedemptionStatus();
  };

  const handleRedeemSuccess = (transaction) => {
    queryClient.invalidateQueries({ queryKey: ['can-user-redeem-course'] });
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
