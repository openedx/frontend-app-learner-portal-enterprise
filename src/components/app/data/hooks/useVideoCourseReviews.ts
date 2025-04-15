import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { queryCourseReviews } from '../queries';
import useVideoCourseMetadata from './useVideoCourseMetadata';

export default function useVideoCourseReviews(courseKey) {
  const { data: courseMetadata } = useVideoCourseMetadata(courseKey);
  return useSuspenseQuery(
    queryOptions({
      ...queryCourseReviews(courseMetadata.key),
    }),
  );
}
