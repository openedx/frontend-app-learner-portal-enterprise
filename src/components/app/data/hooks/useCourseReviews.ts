import { useSuspenseQuery } from '@tanstack/react-query';
import { queryCourseReviews } from '../queries';
import useCourseMetadata from './useCourseMetadata';

export default function useCourseReviews() {
  const { data: courseMetadata } = useCourseMetadata();
  return useSuspenseQuery({
    ...queryCourseReviews(courseMetadata.key),
  });
}
