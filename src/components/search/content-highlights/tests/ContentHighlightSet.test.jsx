import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ContentHighlightSet from '../ContentHighlightSet';
import { renderWithRouter } from '../../../../utils/tests';

const defaultAppContextValue = {
  enterpriseConfig: { uuid: 'test-uuid' },
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
  <IntlProvider locale="en">
    <AppContext.Provider value={appContextValue}>
      <ContentHighlightSet highlightSet={highlightSet} {...rest} />
    </AppContext.Provider>
  </IntlProvider>
);

describe('ContentHighlightSet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders stuff', () => {
    renderWithRouter(<ContentHighlightSetWrapper />);

    expect(screen.getByText(mockHighlightSetTitle)).toBeInTheDocument();
    expect(screen.getByText(mockHighlightedContentItemTitle)).toBeInTheDocument();
  });
});
