import { getLateRedemptionBufferDays } from '../utils';
import useRedeemablePolicies from './useRedeemablePolicies';

export default function useLateRedemptionBufferDays() {
  const { data: { redeemablePolicies } } = useRedeemablePolicies();
  return getLateRedemptionBufferDays(redeemablePolicies);
}
