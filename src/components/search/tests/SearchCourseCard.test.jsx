import React from 'react';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import SearchCourseCard from '../SearchCourseCard';

import { renderWithRouter } from '../../../utils/tests';
import {
  TEST_ENTERPRISE_SLUG,
  EXPECTED_COURSE_CARD_SKELETON_COUNT,
} from '../data/tests/constants';

jest.mock('react-truncate', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('react-loading-skeleton', () => ({
  __esModule: true,
  default: () => <span data-testid="did-i-render" />,
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
const TEST_CARD_IMG_URL = 'http://fake.image';
const TEST_PARTNER_NAME = 'Partner Name';

const defaultProps = {
  hit: {
    key: TEST_COURSE_KEY,
    title: TEST_TITLE,
    card_image_url: TEST_CARD_IMG_URL,
    partners: [TEST_PARTNER_NAME],
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
    expect(screen.getByAltText(TEST_PARTNER_NAME)).toBeInTheDocument();

    expect(container.querySelector('.discovery-card > a')).toHaveAttribute(
      'href',
      `/${TEST_ENTERPRISE_SLUG}/course/${TEST_COURSE_KEY}`,
    );
    expect(container.querySelector('p.partner')).toHaveTextContent(TEST_PARTNER_NAME);
    expect(container.querySelector('.card-img-top')).toHaveAttribute('src', TEST_CARD_IMG_URL);
  });

  test('renders the loading state', () => {
    renderWithRouter(<SearchCourseCardWithAppContext {...propsForLoading} />);

    // assert the mocked out <Skeleton /> loading component renders exactly 5 times
    // to verify course card is properly in a loading state.
    expect(screen.queryAllByTestId('did-i-render')).toHaveLength(EXPECTED_COURSE_CARD_SKELETON_COUNT);

    expect(screen.queryByText(TEST_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByAltText(TEST_PARTNER_NAME)).not.toBeInTheDocument();
  });
});
