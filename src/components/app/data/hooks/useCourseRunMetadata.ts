import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { queryCourseRunMetadata } from '../queries';

type UseCourseRunMetadataQueryOptions = {
  select?: (data: unknown) => unknown;
};

export default function useCourseRunMetadata(
  courseRunKey: string,
  options: UseCourseRunMetadataQueryOptions = {},
) {
  const { select } = options;
  return useSuspenseQuery(
    queryOptions({
      ...queryCourseRunMetadata(courseRunKey),
      select,
    }),
  );
}
