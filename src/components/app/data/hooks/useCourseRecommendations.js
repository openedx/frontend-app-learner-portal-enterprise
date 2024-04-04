import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { queryCourseRecommendations } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useSearchCatalogs from './useSearchCatalogs';

export default function useCourseRecommendations(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { courseKey } = useParams();
  const searchCatalogs = useSearchCatalogs();
  return useQuery({
    ...queryCourseRecommendations(enterpriseCustomer.uuid, courseKey, searchCatalogs),
    ...queryOptions,
  });
}
