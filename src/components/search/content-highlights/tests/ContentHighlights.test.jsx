import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';

import ContentHighlights from '../ContentHighlights';
import { useContentHighlights } from '../data';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    FEATURE_CONTENT_HIGHLIGHTS: true,
  })),
}));

const mockHighlightedContent = {};
const mockHighlightSet = {
  uuid: 'test-highlight-set-uuid',
  cardImageUrl: 'https://image.url',
  enterpriseCuration: 'test-curation-uuid',
  highlightedContent: [mockHighlightedContent],
  isPublished: true,
  title: 'Highlight Set 1',
};

jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  useContentHighlights: jest.fn().mockReturnValue({
    isLoading: false,
    contentHighlights: [],
  }),
}));

jest.mock('../ContentHighlightSet', () => {
  const Component = () => <div data-testid="content-highlight-set" />;
  Component.Skeleton = function Skeleton() { return <div data-testid="content-highlight-set-skeleton" />; };
  return {
    __esModule: true,
    default: Component,
  };
});

const defaultAppContextValue = {
  enterpriseConfig: { uuid: 'test-uuid' },
};

const ContentHighlightsWrapper = ({
  appContextValue = defaultAppContextValue,
  ...rest
}) => (
  <AppContext.Provider value={appContextValue}>
    <ContentHighlights {...rest} />
  </AppContext.Provider>
);

describe('ContentHighlights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('feature flag disabled', () => {
    beforeEach(() => {
      getConfig.mockReturnValue({
        FEATURE_CONTENT_HIGHLIGHTS: false,
      });
    });

    afterEach(() => {
      getConfig.mockReturnValue({
        FEATURE_CONTENT_HIGHLIGHTS: true,
      });
    });

    it('does not render component', () => {
      const { container } = render(<ContentHighlightsWrapper />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('renders loading skeleton when fetching highlight sets', () => {
    useContentHighlights.mockReturnValue({
      isLoading: true,
      contentHighlights: [],
    });
    render(<ContentHighlightsWrapper />);
    expect(screen.getByTestId('content-highlight-set-skeleton')).toBeInTheDocument();
  });

  it('renders nothing when there are no existing highlight sets', () => {
    useContentHighlights.mockReturnValue({
      isLoading: false,
      contentHighlights: [],
    });
    const { container } = render(<ContentHighlightsWrapper />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders existing highlight sets', () => {
    const anotherMockHighlightSet = {
      ...mockHighlightSet,
      title: 'Highlight Set 2',
    };
    useContentHighlights.mockReturnValue({
      isLoading: false,
      contentHighlights: [mockHighlightSet, anotherMockHighlightSet],
    });
    render(<ContentHighlightsWrapper />);
    expect(screen.queryAllByTestId('content-highlight-set')).toHaveLength(2);
  });
});
