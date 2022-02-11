import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import SearchPathwayCard from '../SearchPathwayCard';
import { TEST_ENTERPRISE_SLUG, TEST_ENTERPRISE_UUID } from './constants';

import { renderWithRouter } from '../../../utils/tests';

jest.mock('react-truncate', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('react-loading-skeleton', () => ({
  __esModule: true,
  // eslint-disable-next-line react/prop-types
  default: (props = {}) => <div data-testid={props['data-testid']} />,
}));

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const SearchPathwayCardWithAppContext = (props) => (
  <AppContext.Provider
    value={{
      enterpriseConfig: { slug: TEST_ENTERPRISE_SLUG, uuid: TEST_ENTERPRISE_UUID },
    }}
  >
    <SearchPathwayCard {...props} />
  </AppContext.Provider>
);

const TEST_PATHWAY_UUID = 'test-pathway-uuid';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMG_URL = 'http://fake.image';

const defaultProps = {
  hit: {
    uuid: TEST_PATHWAY_UUID,
    title: TEST_TITLE,
    card_image_url: TEST_CARD_IMG_URL,
  },
};

const propsForLoading = {
  hit: {},
  isLoading: true,
};

describe('<SearchPathwayCard />', () => {
  test('renders the correct data', () => {
    const { container } = renderWithRouter(<SearchPathwayCardWithAppContext {...defaultProps} />);

    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();

    expect(container.querySelector('.search-pathway-card > a')).toHaveAttribute(
      'href',
      `/#pathway-${TEST_PATHWAY_UUID}`,
    );
    expect(container.querySelector('.card-img-top')).toHaveAttribute('src', TEST_CARD_IMG_URL);

    fireEvent.click(screen.getByText(TEST_TITLE));
    expect(screen.getByRole('dialog'));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_UUID,
      'edx.ui.enterprise.learner_portal.search.pathway.card.clicked',
      expect.objectContaining({
        pathwayUUID: TEST_PATHWAY_UUID,
      }),
    );
  });

  test('renders the tags correctly', () => {
    const tag50CharactersLong = 'Tag 50 characters long.Tag 50 characters long.Tag 50 characters long.Tag 50 characters.';
    const firstTag = 'Software Engineering';
    const secondTag = 'Database Design Principles';
    const thirdTag = 'Third final tag';
    const fourthTag = 'Fourth tag that should not be displayed.';
    defaultProps.hit.tags = [
      tag50CharactersLong, firstTag, secondTag, thirdTag, fourthTag,
    ];
    const { container } = renderWithRouter(<SearchPathwayCardWithAppContext {...defaultProps} />);

    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();

    expect(container.querySelector('.search-pathway-card > a')).toHaveAttribute(
      'href',
      `/#pathway-${TEST_PATHWAY_UUID}`,
    );
    expect(container.querySelector('.pathway-tags').getElementsByClassName('pathway-badge')).toHaveLength(3);
    expect(container.querySelector('.pathway-tags').textContent).toContain(firstTag);
    expect(container.querySelector('.pathway-tags').textContent).toContain(secondTag);
    expect(container.querySelector('.pathway-tags').textContent).toContain(thirdTag);
    expect(container.querySelector('.pathway-tags').textContent).not.toContain(fourthTag);
  });

  test('renders the loading state', () => {
    renderWithRouter(<SearchPathwayCardWithAppContext {...propsForLoading} />);

    // assert <Skeleton /> loading components render to verify
    // course card is properly in a loading state.
    expect(screen.queryByTestId('card-img-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('partner-logo-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('pathway-title-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('content-type-loading')).toBeInTheDocument();
  });
});
