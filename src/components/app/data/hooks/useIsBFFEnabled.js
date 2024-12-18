import { isBFFEnabled } from '../utils';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useEnterpriseFeatures from './useEnterpriseFeatures';

export default function useIsBFFEnabled() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: enterpriseFeatures } = useEnterpriseFeatures();
  return isBFFEnabled(enterpriseCustomer.uuid, enterpriseFeatures);
}
