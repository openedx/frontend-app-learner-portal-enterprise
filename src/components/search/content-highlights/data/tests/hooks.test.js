import { logError } from '@edx/frontend-platform/logging';
import { getConfig } from '@edx/frontend-platform/config';
import { renderHook } from '@testing-library/react';
import {
  getEnterpriseCuration,
} from '../service';
import {
  getHighlightedContentCardVariant,
  getFormattedContentType,
  getAuthoringOrganizations,
  getContentPageUrl,
} from '../utils';
import { useHighlightedContentCardData, useEnterpriseCuration } from '../hooks';

jest.mock('../../../../app/data', () => ({
  fetchContentHighlights: jest.fn(() => Promise.resolve({ data: { results: [] } })),
}));
jest.mock('../service.js', () => ({
  getEnterpriseCuration: jest.fn(() => Promise.resolve({ data: { results: [] } })),
}));
jest.mock('../utils', () => ({
  getHighlightedContentCardVariant: jest.fn(() => 'default'),
  getFormattedContentType: jest.fn(() => 'default'),
  getAuthoringOrganizations: jest.fn(() => []),
  getContentPageUrl: jest.fn(() => 'default'),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({ FEATURE_CONTENT_HIGHLIGHTS: true })),
}));

describe('useHighlightedContentCardData', () => {
  it('should return an empty object if highlightedContent is not provided', () => {
    const { result } = renderHook(() => useHighlightedContentCardData({ enterpriseSlug: 'test-slug' }));
    expect(result.current).toEqual({});
  });

  it('should set the correct data on the returned object', () => {
    const highlightedContent = {
      contentKey: 'test-content-key',
      contentType: 'test-content-type',
      title: 'Test Content',
      cardImageUrl: 'test-image-url',
      authoringOrganizations: ['Test Organization'],
      aggregationKey: 'test-aggregation-key',
    };
    const { result } = renderHook(() => useHighlightedContentCardData({ enterpriseSlug: 'test-slug', highlightedContent }));
    expect(getHighlightedContentCardVariant).toHaveBeenCalledWith(highlightedContent.contentType);
    expect(getContentPageUrl).toHaveBeenCalledWith({
      contentKey: highlightedContent.contentKey,
      contentType: highlightedContent.contentType,
      enterpriseSlug: 'test-slug',
    });
    expect(getFormattedContentType).toHaveBeenCalledWith(highlightedContent.contentType);
    expect(getAuthoringOrganizations).toHaveBeenCalledWith(highlightedContent.authoringOrganizations);
    expect(result.current).toEqual({
      aggregationKey: highlightedContent.aggregationKey,
      variant: 'default',
      href: 'default',
      contentType: 'default',
      title: highlightedContent.title,
      cardImageUrl: highlightedContent.cardImageUrl,
      authoringOrganizations: [],
    });
  });
});
describe('useEnterpriseCuration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    { hasResults: true, hasFallbackCuration: false },
    { hasResults: false, hasFallbackCuration: true },
  ])('should fetch enterprise curation and set it to state', async ({ hasResults, hasFallbackCuration }) => {
    const enterpriseUUID = '123';
    const enterpriseCuration = {
      id: '123',
      name: 'Test Enterprise',
      canOnlyViewHighlightSets: false,
    };
    const fallbackEnterpriseCuration = {
      canOnlyViewHighlightSets: false,
    };
    getEnterpriseCuration.mockResolvedValue({
      data: {
        results: hasResults ? [enterpriseCuration] : [],
      },
    });
    getConfig.mockReturnValue({ FEATURE_CONTENT_HIGHLIGHTS: true });

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCuration(enterpriseUUID));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.enterpriseCuration).toEqual({});

    await waitForNextUpdate();

    expect(getEnterpriseCuration).toHaveBeenCalledWith(enterpriseUUID);
    expect(result.current.isLoading).toBe(false);

    if (hasFallbackCuration) {
      expect(result.current.enterpriseCuration).toEqual(fallbackEnterpriseCuration);
    } else {
      expect(result.current.enterpriseCuration).toEqual(enterpriseCuration);
    }
  });

  it('should handle fetch errors and set error to state', async () => {
    const enterpriseUUID = '123';
    const fetchError = new Error('Test error');
    getEnterpriseCuration.mockRejectedValue(fetchError);
    getConfig.mockReturnValue({ FEATURE_CONTENT_HIGHLIGHTS: true });

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCuration(enterpriseUUID));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.enterpriseCuration).toEqual({});
    expect(result.current.fetchError).toBeUndefined();

    await waitForNextUpdate();

    expect(getEnterpriseCuration).toHaveBeenCalledWith(enterpriseUUID);
    expect(logError).toHaveBeenCalledWith(fetchError);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.enterpriseCuration).toEqual({
      canOnlyViewHighlightSets: false,
    });
    expect(result.current.fetchError).toEqual(fetchError);
  });
});
