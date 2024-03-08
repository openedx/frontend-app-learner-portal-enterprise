import { useEnterpriseLearner } from '../app/data';

export default function useEnterpriseFeatures() {
  const { data: { enterpriseFeatures } } = useEnterpriseLearner();
  return {
    ...enterpriseFeatures,
  };
}
