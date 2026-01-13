import { renderHook } from '@testing-library/react';
import {
  getHighlightedContentCardVariant,
  getFormattedContentType,
  getAuthoringOrganizations,
  getContentPageUrl,
} from '../utils';
import { useHighlightedContentCardData } from '../hooks';

jest.mock('../../../../app/data', () => ({
  fetchContentHighlights: jest.fn(() => Promise.resolve({ data: { results: [] } })),
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
jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: jest.fn(() => ({
    formatMessage: jest.fn((msg) => msg.defaultMessage),
  })),
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
    expect(getFormattedContentType).toHaveBeenCalledWith(
      highlightedContent.contentType,
      expect.objectContaining({
        formatMessage: expect.any(Function),
      }),
    );
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
