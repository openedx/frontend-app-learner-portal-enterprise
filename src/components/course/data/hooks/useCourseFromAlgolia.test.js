import { renderHook, waitFor } from '@testing-library/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { useCourseFromAlgolia } from './useCourseFromAlgolia';
import { useAlgoliaSearch, useEnterpriseCustomer } from '../../../app/data';
import { getSupportedLocale } from '../../../app/data/utils';

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useAlgoliaSearch: jest.fn(),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('../../../app/data/utils', () => ({
  ...jest.requireActual('../../../app/data/utils'),
  getSupportedLocale: jest.fn(),
}));

jest.mock('@edx/frontend-platform/utils', () => ({
  camelCaseObject: jest.fn((obj) => obj),
}));

const mockCourseKey = 'edX+DemoX';
const mockSearchIndex = {
  search: jest.fn(),
};
const mockEnterpriseCustomer = {
  uuid: 'test-enterprise-uuid',
};

const mockAlgoliaCourseHit = {
  key: 'edX+DemoX',
  title: 'Demo Course',
  short_description: 'Spanish description',
  metadata_language: 'es',
};

describe('useCourseFromAlgolia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSupportedLocale.mockReturnValue('es');
    useAlgoliaSearch.mockReturnValue({
      searchIndex: mockSearchIndex,
      shouldUseSecuredAlgoliaApiKey: false,
    });
    useEnterpriseCustomer.mockReturnValue({
      data: mockEnterpriseCustomer,
    });
  });

  it('should fetch course from Algolia with language filter for non-English locale', async () => {
    mockSearchIndex.search.mockResolvedValue({
      hits: [mockAlgoliaCourseHit],
    });

    const { result } = renderHook(() => useCourseFromAlgolia(mockCourseKey));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSearchIndex.search).toHaveBeenCalledWith(mockCourseKey, {
      facetFilters: [
        ['content_type:course'],
        'metadata_language:es',
        `enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}`,
      ],
      hitsPerPage: 10,
    });
    expect(result.current.algoliaCourse).toEqual(mockAlgoliaCourseHit);
  });

  it('should not fetch from Algolia when locale is English', async () => {
    getSupportedLocale.mockReturnValue('en');

    const { result } = renderHook(() => useCourseFromAlgolia(mockCourseKey));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSearchIndex.search).not.toHaveBeenCalled();
    expect(result.current.algoliaCourse).toBeNull();
  });

  it('should find exact match by key field', async () => {
    const multipleHits = [
      { key: 'OtherCourse+123', title: 'Other Course' },
      mockAlgoliaCourseHit,
      { key: 'AnotherCourse+456', title: 'Another Course' },
    ];
    mockSearchIndex.search.mockResolvedValue({
      hits: multipleHits,
    });

    const { result } = renderHook(() => useCourseFromAlgolia(mockCourseKey));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.algoliaCourse).toEqual(mockAlgoliaCourseHit);
  });

  it('should return null when no exact match is found', async () => {
    mockSearchIndex.search.mockResolvedValue({
      hits: [
        { key: 'OtherCourse+123', title: 'Other Course' },
      ],
    });

    const { result } = renderHook(() => useCourseFromAlgolia(mockCourseKey));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.algoliaCourse).toBeNull();
  });

  it('should return null when no hits are found', async () => {
    mockSearchIndex.search.mockResolvedValue({
      hits: [],
    });

    const { result } = renderHook(() => useCourseFromAlgolia(mockCourseKey));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.algoliaCourse).toBeNull();
  });

  it('should handle search errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSearchIndex.search.mockRejectedValue(new Error('Algolia error'));

    const { result } = renderHook(() => useCourseFromAlgolia(mockCourseKey));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching course from Algolia:',
      expect.any(Error),
    );
    expect(result.current.algoliaCourse).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it('should not fetch when searchIndex is not available', async () => {
    useAlgoliaSearch.mockReturnValue({
      searchIndex: null,
      shouldUseSecuredAlgoliaApiKey: false,
    });

    const { result } = renderHook(() => useCourseFromAlgolia(mockCourseKey));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSearchIndex.search).not.toHaveBeenCalled();
    expect(result.current.algoliaCourse).toBeNull();
  });

  it('should not fetch when courseKey is not provided', async () => {
    const { result } = renderHook(() => useCourseFromAlgolia(null));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSearchIndex.search).not.toHaveBeenCalled();
    expect(result.current.algoliaCourse).toBeNull();
  });

  it('should not include enterprise filter when using secured API key', async () => {
    useAlgoliaSearch.mockReturnValue({
      searchIndex: mockSearchIndex,
      shouldUseSecuredAlgoliaApiKey: true,
    });
    mockSearchIndex.search.mockResolvedValue({
      hits: [mockAlgoliaCourseHit],
    });

    renderHook(() => useCourseFromAlgolia(mockCourseKey));

    await waitFor(() => {
      expect(mockSearchIndex.search).toHaveBeenCalledWith(mockCourseKey, {
        facetFilters: [
          ['content_type:course'],
          'metadata_language:es',
        ],
        hitsPerPage: 10,
      });
    });
  });

  it('should camelCase the algolia response', async () => {
    const snakeCaseHit = {
      key: 'edX+DemoX',
      short_description: 'Test description',
    };
    mockSearchIndex.search.mockResolvedValue({
      hits: [snakeCaseHit],
    });

    renderHook(() => useCourseFromAlgolia(mockCourseKey));

    await waitFor(() => {
      expect(camelCaseObject).toHaveBeenCalledWith(snakeCaseHit);
    });
  });
});
