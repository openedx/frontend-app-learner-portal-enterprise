import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { QueryClientProvider } from '@tanstack/react-query';
import ContentHighlightSet from '../ContentHighlightSet';
import { queryClient, renderWithRouter } from '../../../../utils/tests';
import { useEnterpriseCustomer } from '../../../app/data';

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const defaultAppContextValue = {
  authenticatedUser: { username: 'test-username' },
};

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

const ContentHighlightSetWrapper = ({
  appContextValue = defaultAppContextValue,
  highlightSet = mockHighlightSet,
  ...rest
}) => (
  <QueryClientProvider client={queryClient()}>
    <IntlProvider locale="en">
      <AppContext.Provider value={appContextValue}>
        <ContentHighlightSet highlightSet={highlightSet} {...rest} />
      </AppContext.Provider>
    </IntlProvider>
  </QueryClientProvider>
);

const mockEnterpriseCustomer = {
  name: 'test-enterprise',
  slug: 'test',
  uuid: '12345',
};

describe('ContentHighlightSet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  it('renders stuff', () => {
    renderWithRouter(<ContentHighlightSetWrapper />);

    expect(screen.getByText(mockHighlightSetTitle)).toBeInTheDocument();
    expect(screen.getByText(mockHighlightedContentItemTitle)).toBeInTheDocument();
  });
});
