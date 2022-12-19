import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import SearchCourseCard from '../SearchCourseCard';

import { renderWithRouter } from '../../../utils/tests';
import { TEST_ENTERPRISE_SLUG, TEST_IMAGE_URL } from './constants';

jest.mock('react-truncate', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

const SearchCourseCardWithAppContext = (props) => (
  <AppContext.Provider
    value={{
      enterpriseConfig: { slug: TEST_ENTERPRISE_SLUG },
    }}
  >
    <SearchCourseCard {...props} />
  </AppContext.Provider>
);

const TEST_COURSE_KEY = 'test-course-key';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMG_URL = 'https://fake.image';
const TEST_PARTNER = {
  name: 'Partner Name',
  logoImageUrl: TEST_IMAGE_URL,
};

const defaultProps = {
  hit: {
    key: TEST_COURSE_KEY,
    title: TEST_TITLE,
    card_image_url: TEST_CARD_IMG_URL,
    partners: [TEST_PARTNER],
  },
};

const propsForLoading = {
  hit: {},
  isLoading: true,
};

describe('<SearchCourseCard />', () => {
  test('renders the correct data', () => {
    const { container } = renderWithRouter(<SearchCourseCardWithAppContext {...defaultProps} />);

    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();
    expect(screen.getByAltText(TEST_PARTNER.name)).toBeInTheDocument();
    expect(screen.getByText(TEST_PARTNER.name)).toBeInTheDocument();
    expect(screen.getByText('Course')).toBeInTheDocument();

    // should show both logo image and card image with proper URLs
    const cardImages = container.querySelectorAll('img');
    expect(cardImages).toHaveLength(2);
    cardImages.forEach((cardImg) => {
      expect(cardImg).toHaveAttribute('src', TEST_CARD_IMG_URL);
    });
  });

  test('handles card click', () => {
    const { history } = renderWithRouter(<SearchCourseCardWithAppContext {...defaultProps} />);
    const cardEl = screen.getByTestId('search-course-card');
    userEvent.click(cardEl);
    expect(history.entries).toHaveLength(2);
    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}/course/${TEST_COURSE_KEY}`);
  });

  test('renders the loading state', () => {
    const { container, history } = renderWithRouter(<SearchCourseCardWithAppContext {...propsForLoading} />);

    // ensure `Card` was passed `isLoading` by asserting each `Card` subcomponent
    // is treated as a skeleton instead, indicated by `aria-busy="true"`.
    expect(container.querySelectorAll('[aria-busy="true"]')).toHaveLength(4);

    // does not do anything when clicked
    const cardEl = screen.getByTestId('search-course-card');
    userEvent.click(cardEl);
    expect(history.entries).toHaveLength(1);
  });
});
