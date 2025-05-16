import { renderHook } from '@testing-library/react';
import { generateTestPermutations } from '../../../../utils/tests';
import { useContentTypeFilter } from './index';

describe('useContentTypeFilter', () => {
  it.each(generateTestPermutations(
    {
      filter: ['test_filter', ''],
      contentType: ['course', ''],
    },
  ))('returns all the expected content type filters.', ({
    filter,
    contentType,
  }) => {
    let expectedFilters;
    if (!filter) {
      expectedFilters = {
        courseFilter: 'content_type:course',
        videoFilter: 'content_type:video',
        programFilter: 'content_type:program',
        pathwayFilter: 'content_type:learnerpathway',
      };
      if (contentType) {
        expectedFilters.contentTypeFilter = `content_type:${contentType}`;
      } else {
        expectedFilters.contentTypeFilter = null;
      }
    } else {
      expectedFilters = {
        courseFilter: `content_type:course AND ${filter}`,
        videoFilter: `content_type:video AND ${filter}`,
        programFilter: `content_type:program AND ${filter}`,
        pathwayFilter: `content_type:learnerpathway AND ${filter}`,
      };
      if (contentType) {
        expectedFilters.contentTypeFilter = `content_type:${contentType} AND ${filter}`;
      } else {
        expectedFilters.contentTypeFilter = null;
      }
    }

    const { result } = renderHook(() => useContentTypeFilter({ filter, contentType }));
    expect(result.current).toEqual(expectedFilters);
  });
});
