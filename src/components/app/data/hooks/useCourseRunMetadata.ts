import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { queryCourseRunMetadata } from '../queries';

type UseCourseRunMetadataQueryOptions = {
  select?: (data: unknown) => unknown;
};

export function useCourseRunMetadata(
  courseRunKey: string,
  options: UseCourseRunMetadataQueryOptions = {},
) {
  const { select } = options;
  return useQuery(
    queryOptions({
      ...queryCourseRunMetadata(courseRunKey),
      select,
    }),
  );
}

export function useCourseRunMetadataSuspense(
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
