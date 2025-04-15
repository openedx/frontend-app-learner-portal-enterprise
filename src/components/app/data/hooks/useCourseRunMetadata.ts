import { useSuspenseQuery } from '@tanstack/react-query';
import { queryCourseRunMetadata } from '../queries';

type UseCourseRunMetadataQueryOptions = {
  select?: (data: unknown) => unknown;
};

export default function useCourseRunMetadata(
  courseRunKey: string,
  queryOptions: UseCourseRunMetadataQueryOptions = {},
) {
  const { select } = queryOptions;
  return useSuspenseQuery({
    ...queryCourseRunMetadata(courseRunKey),
    select,
  });
}
