import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ContentHighlightSet from '../ContentHighlightSet';
import { renderWithRouter } from '../../../../utils/tests';
import { useEnterpriseCustomer } from '../../../app/data';

const mockEnterpriseCustomer = {
  name: 'test-enterprise',
  slug: 'test',
  uuid: '12345',
};

jest.mock('../../../app/data', () => ({
  useEnterpriseCustomer: jest.fn(),
}));

const mockHighlightSetTitle = 'Test Highlight Set';
const mockHighlightedContentItemTitle = 'Demonstration Course';
const mockHighlightedContentItem = {
  contentKey: 'edX+DemoX',
  contentType: 'course',
  title: mockHighlightedContentItemTitle,
  cardImageUrl: 'https://fake.image',
  authoringOrganizations: [],
  aggregationKey: 'course:edX+DemoX',
  courseRunStatuses: ['published'],
};
const mockHighlightSet = {
  uuid: 'test-highlightset-uuid',
  highlightedContent: [mockHighlightedContentItem],
  title: mockHighlightSetTitle,
};

const ContentHighlightSetWrapper = ({ ...props }) => (
  <IntlProvider locale="en">
    <ContentHighlightSet {...props} />
  </IntlProvider>
);

describe('ContentHighlightSet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  it('renders stuff', () => {
    renderWithRouter(<ContentHighlightSetWrapper {...mockHighlightSet} />);

    expect(screen.getByText(mockHighlightSetTitle)).toBeInTheDocument();
    expect(screen.getByText(mockHighlightedContentItemTitle)).toBeInTheDocument();
  });
});
