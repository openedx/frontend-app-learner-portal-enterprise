import { useMemo } from 'react';
import {
  CONTENT_TYPE_COURSE,
  CONTENT_TYPE_PATHWAY,
  CONTENT_TYPE_PROGRAM,
  CONTENT_TYPE_VIDEO,
} from '../../../search/constants';
import { AlgoliaFilterBuilder } from '../../../AlgoliaFilterBuilder';

interface UseContentTypeFilterParams {
  filter: string;
  contentTypes?: string[];
}

interface ContentTypeFilterResult {
  courseFilter: string;
  programFilter: string;
  pathwayFilter: string;
  videoFilter: string;
  contentTypeFilter: string | null;
}

const buildContentTypeFilter = (filter: string, contentType: string): string => {
  const baseFilter = new AlgoliaFilterBuilder().and('content_type', contentType);
  if (filter) {
    baseFilter.andRaw(filter);
  }
  return baseFilter.build();
};

const useContentTypeFilter = (
  { filter, contentTypes = [] }: UseContentTypeFilterParams,
): ContentTypeFilterResult => useMemo(() => ({
  courseFilter: buildContentTypeFilter(filter, CONTENT_TYPE_COURSE),
  programFilter: buildContentTypeFilter(filter, CONTENT_TYPE_PROGRAM),
  pathwayFilter: buildContentTypeFilter(filter, CONTENT_TYPE_PATHWAY),
  videoFilter: buildContentTypeFilter(filter, CONTENT_TYPE_VIDEO),
  contentTypeFilter: contentTypes[0] ? buildContentTypeFilter(filter, contentTypes[0]) : null,
}), [contentTypes, filter]);

export default useContentTypeFilter;
