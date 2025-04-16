import { useParams } from 'react-router-dom';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { queryCourseRecommendations } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useSearchCatalogs from './useSearchCatalogs';

export default function useCourseRecommendations() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  const params = useParams();
  const courseKey = params.courseKey!;
  const searchCatalogs = useSearchCatalogs();
  return useSuspenseQuery(
    queryOptions({
      ...queryCourseRecommendations(enterpriseCustomer.uuid, courseKey, searchCatalogs),
    }),
  );
}
