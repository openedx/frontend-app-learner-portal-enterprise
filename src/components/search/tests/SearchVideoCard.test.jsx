import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';

import { renderWithRouter } from '../../../utils/tests';
import { TEST_ENTERPRISE_SLUG, TEST_IMAGE_URL } from './constants';
import { useEnterpriseCustomer } from '../../app/data';
import SearchVideoCard from '../SearchVideoCard';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const initialAppState = {
  authenticatedUser: { userId: 'test-user-id', username: 'test-username' },
};

const SearchVideoCardWithAppContext = (props) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SearchVideoCard {...props} />
    </AppContext.Provider>
  </IntlProvider>
);

const TEST_VIDEO_KEY = 'test-video-key';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMG_URL = 'https://fake.image';
const TEST_ORG = 'some_org';
const TEST_AGGREGATION_KEY = 'some_key';
const TEST_HIT = {
  key: TEST_VIDEO_KEY,
  title: TEST_TITLE,
  aggregation_key: TEST_AGGREGATION_KEY,
  content_type: 'video',
  course_run_key: 'some_key',
  image_url: TEST_CARD_IMG_URL,
  logo_image_urls: [TEST_IMAGE_URL],
  org: TEST_ORG,
  duration: 135,
};
const defaultProps = {
  hit: TEST_HIT,
};

const propsForLoading = {
  hit: TEST_HIT,
  isLoading: true,
};

const propsForEmptyHits = {
  hit: undefined,
  isLoading: false,
};

const mockEnterpriseCustomer = {
  name: 'test-enterprise',
  slug: 'test-enterprise-slug',
  uuid: 'test-enterprise-uuid',
};

describe('<SearchVideoCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });

    // reset the router history between tests
    beforeEach(() => {
      window.history.pushState({}, '', '/');
    });
  });

  test('renders the correct data', () => {
    const { container } = renderWithRouter(<SearchVideoCardWithAppContext {...defaultProps} />);

    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();
    expect(screen.getByText(TEST_ORG)).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();

    // should show both logo image and card image with proper URLs
    const cardImages = container.querySelectorAll('img');
    expect(cardImages).toHaveLength(2);
    cardImages.forEach((cardImg) => {
      expect(cardImg).toHaveAttribute('src', TEST_CARD_IMG_URL);
    });
  });

  test('handles card click', () => {
    renderWithRouter(<SearchVideoCardWithAppContext {...defaultProps} />);
    const cardEl = screen.getByTestId('search-video-card');
    userEvent.click(cardEl);
    expect(window.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}/videos/${TEST_AGGREGATION_KEY}/`);
  });

  test('renders the empty hits state, that will not broke the page', () => {
    renderWithRouter(<SearchVideoCardWithAppContext {...propsForEmptyHits} />);
    expect(screen.getByTestId('search-video-card')).toBeInTheDocument();
  });
  test('renders the empty hits state with loading true', () => {
    renderWithRouter(<SearchVideoCardWithAppContext {...propsForLoading} />);
    expect(screen.getByTestId('search-video-card')).toBeInTheDocument();
  });
});
