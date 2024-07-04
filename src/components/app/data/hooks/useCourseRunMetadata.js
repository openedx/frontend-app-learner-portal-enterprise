import { useQuery } from '@tanstack/react-query';
import { queryCourseRunMetadata } from '../queries';

export default function useCourseRunMetadata(courseRunKey, queryOptions = {}) {
  return useQuery({
    ...queryCourseRunMetadata(courseRunKey),
    ...queryOptions,
  });
}
