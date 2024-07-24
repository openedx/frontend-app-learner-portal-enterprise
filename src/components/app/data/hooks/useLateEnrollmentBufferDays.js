import { getLateEnrollmentBufferDays } from '../utils';
import useRedeemablePolicies from './useRedeemablePolicies';

export default function useLateEnrollmentBufferDays(queryOptions = {}) {
  const { data } = useRedeemablePolicies(queryOptions);
  const { redeemablePolicies } = data || {};
  return getLateEnrollmentBufferDays(redeemablePolicies);
}
