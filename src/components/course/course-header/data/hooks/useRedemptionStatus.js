import { useState } from 'react';

/**
 * TODO
 * @returns
 */
const useRedemptionStatus = () => {
  const [redemptionStatus, setRedemptionStatus] = useState();

  const handleRedeemClick = () => {
    setRedemptionStatus();
  };

  const handleRedeemSuccess = (transaction) => {
    setRedemptionStatus('success');
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
