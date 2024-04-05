import { useQuery } from '@tanstack/react-query';
import { queryCourseReviews } from '../queries';
import useCourseMetadata from './useCourseMetadata';

export default function useCourseReviews(queryOptions = {}) {
  const { data: courseMetadata } = useCourseMetadata();
  return useQuery({
    ...queryCourseReviews(courseMetadata.key),
    ...queryOptions,
  });
}
