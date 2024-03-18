import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';

import ContentHighlights from '../ContentHighlights';
import { useEnterpriseCustomer } from '../../../app/data';
import { useContentHighlights } from '../../../hooks';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    FEATURE_CONTENT_HIGHLIGHTS: true,
  })),
}));

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useContentHighlights: jest.fn(),
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

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useContentHighlights: jest.fn().mockReturnValue({
    data: [],
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
  authenticatedUser: { username: 'test-username' },
};

const ContentHighlightsWrapper = ({
  appContextValue = defaultAppContextValue,
  ...rest
}) => (
  <AppContext.Provider value={appContextValue}>
    <ContentHighlights {...rest} />
  </AppContext.Provider>
);

const mockEnterpriseCustomer = {
  name: 'test-enterprise',
  slug: 'test-enterprise-slug',
  uuid: 'test-enterprise-uuid',
};

describe('ContentHighlights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
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
      useContentHighlights.mockReturnValue({ data: [] });
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('renders nothing when there are no existing highlight sets', () => {
    useContentHighlights.mockReturnValue({ data: [] });
    const { container } = render(<ContentHighlightsWrapper />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders existing highlight sets', () => {
    const anotherMockHighlightSet = {
      ...mockHighlightSet,
      title: 'Highlight Set 2',
    };
    useContentHighlights.mockReturnValue({
      data: [mockHighlightSet, anotherMockHighlightSet],
    });
    render(<ContentHighlightsWrapper />);
    expect(screen.queryAllByTestId('content-highlight-set')).toHaveLength(2);
  });
});
