import { useQuery } from '@tanstack/react-query';
import { queryCourseReviews } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useCourseMetadata from './useCourseMetadata';

export default function useCourseReviews(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: courseMetadata } = useCourseMetadata();
  return useQuery({
    ...queryCourseReviews(enterpriseCustomer.uuid, courseMetadata.key),
    ...queryOptions,
  });
}
