import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { queryCanRequest } from '../../../app/data/queries';
import useEnterpriseCustomer from '../../../app/data/hooks/useEnterpriseCustomer';
import { useCourseMetadata, useCourseRunKeyQueryParam } from '../../../app/data';

export default function useCourseRequest() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  const { data: courseMetadata } = useCourseMetadata();
  console.log('useCourseRequest', enterpriseCustomer, courseMetadata);

  const params = useParams();
  const courseKey = params.courseKey!;
  return useQuery(queryCanRequest(enterpriseCustomer.uuid, courseKey, 'course-v1:edX+CS101+2T2025'));
}
