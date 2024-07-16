import { getLateRedemptionBufferDays } from '../utils';
import useRedeemablePolicies from './useRedeemablePolicies';

export default function useLateRedemptionBufferDays(queryOptions = {}) {
  const { data } = useRedeemablePolicies(queryOptions);
  const { redeemablePolicies } = data || {};
  return getLateRedemptionBufferDays(redeemablePolicies);
}
