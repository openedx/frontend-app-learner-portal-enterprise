import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getConfig } from '@edx/frontend-platform/config';

import ContentHighlights from '../ContentHighlights';
import { useContentHighlightSets, useEnterpriseCustomer } from '../../../app/data';
import { enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    FEATURE_CONTENT_HIGHLIGHTS: true,
  })),
}));

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useContentHighlightSets: jest.fn(),
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

jest.mock('../ContentHighlightSet', () => {
  const Component = () => <div data-testid="content-highlight-set" />;
  Component.Skeleton = function Skeleton() { return <div data-testid="content-highlight-set-skeleton" />; };
  return {
    __esModule: true,
    default: Component,
  };
});


const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('ContentHighlights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useContentHighlightSets.mockReturnValue({ data: [] });
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
      const { container } = render(<ContentHighlights />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('renders existing highlight sets', () => {
    const anotherMockHighlightSet = {
      ...mockHighlightSet,
      title: 'Highlight Set 2',
    };
    useContentHighlightSets.mockReturnValue({
      data: [mockHighlightSet, anotherMockHighlightSet],
    });
    render(<ContentHighlights />);
    expect(screen.queryAllByTestId('content-highlight-set')).toHaveLength(2);
  });
});
