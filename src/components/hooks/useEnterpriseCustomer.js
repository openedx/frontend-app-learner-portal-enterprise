import { useEnterpriseLearner } from '../app/data';

export default function useEnterpriseCustomer() {
  const { data } = useEnterpriseLearner();
  return data.enterpriseCustomer;
}
