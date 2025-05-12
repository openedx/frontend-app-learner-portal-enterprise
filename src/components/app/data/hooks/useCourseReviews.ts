import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { queryCourseReviews } from '../queries';
import useCourseMetadata from './useCourseMetadata';

export default function useCourseReviews() {
  const { data: courseMetadata } = useCourseMetadata();
  return useSuspenseQuery(
    queryOptions({
      ...queryCourseReviews(courseMetadata.key),
    }),
  );
}
