import { useQuery } from '@tanstack/react-query';
import { queryCourseReviews } from '../queries';
import useVideoCourseMetadata from './useVideoCourseMetadata';

export default function useVideoCourseReviews(courseKey, queryOptions = {}) {
  const { data: courseMetadata } = useVideoCourseMetadata(courseKey);
  return useQuery({
    ...queryCourseReviews(courseMetadata.key),
    ...queryOptions,
  });
}
