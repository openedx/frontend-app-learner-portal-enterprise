import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { queryCanRequest } from '../../../app/data/queries';
import useEnterpriseCustomer from '../../../app/data/hooks/useEnterpriseCustomer';

export default function useCourseRequest() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();

  const params = useParams();
  const courseKey = params.courseKey!;
  return useQuery(queryCanRequest(enterpriseCustomer.uuid, courseKey));
}
