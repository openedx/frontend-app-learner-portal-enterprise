import { getLateEnrollmentBufferDays } from '../utils';
import useRedeemablePolicies from './useRedeemablePolicies';

export default function useLateEnrollmentBufferDays() {
  const { data } = useRedeemablePolicies();
  const { redeemablePolicies } = data || {};
  return getLateEnrollmentBufferDays(redeemablePolicies);
}
