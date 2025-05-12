import { useMemo } from 'react';
import {
  CONTENT_TYPE_COURSE,
  CONTENT_TYPE_PATHWAY,
  CONTENT_TYPE_PROGRAM,
  CONTENT_TYPE_VIDEO,
} from '../../../search/constants';
import { AlgoliaFilterBuilder } from '../../../AlgoliaFilterBuilder';

const buildContentTypeFilter = (filter: string, contentType: string) => {
  const baseFilter = new AlgoliaFilterBuilder().and('content_type', contentType);
  if (filter) {
    baseFilter.andRaw(filter);
  }
  return baseFilter.build();
};

const useContentTypeFilter = ({ filter, contentTypes = [] }) => useMemo(() => ({
  courseFilter: buildContentTypeFilter(filter, CONTENT_TYPE_COURSE),
  programFilter: buildContentTypeFilter(filter, CONTENT_TYPE_PROGRAM),
  pathwayFilter: buildContentTypeFilter(filter, CONTENT_TYPE_PATHWAY),
  videoFilter: buildContentTypeFilter(filter, CONTENT_TYPE_VIDEO),
  contentTypeFilter: contentTypes[0] ? buildContentTypeFilter(filter, contentTypes[0]) : null,
}), [contentTypes, filter]);

export default useContentTypeFilter;
