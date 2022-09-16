import React, { useMemo } from 'react';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import SearchCourseCard from '../SearchCourseCard';

import { renderWithRouter } from '../../../utils/tests';
import { TEST_ENTERPRISE_SLUG, TEST_IMAGE_URL } from './constants';

jest.mock('react-truncate', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('react-loading-skeleton', () => ({
  __esModule: true,
  // eslint-disable-next-line react/prop-types
  default: (props = {}) => <div data-testid={props['data-testid']} />,
}));

function SearchCourseCardWithAppContext(props) {
  const contextValue = useMemo(() => ({
    enterpriseConfig: { slug: TEST_ENTERPRISE_SLUG },
  }), []);
  return (
    <AppContext.Provider value={contextValue}>
      <SearchCourseCard {...props} />
    </AppContext.Provider>
  );
}

const TEST_COURSE_KEY = 'test-course-key';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMG_URL = 'http://fake.image';
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

    expect(container.querySelector('.search-course-card > a')).toHaveAttribute(
      'href',
      `/${TEST_ENTERPRISE_SLUG}/course/${TEST_COURSE_KEY}`,
    );
    expect(container.querySelector('p.partner')).toHaveTextContent(TEST_PARTNER.name);
    expect(container.querySelector('.pgn__card-image-cap')).toHaveAttribute('src', TEST_CARD_IMG_URL);
  });

  test('renders the loading state', () => {
    const { container } = renderWithRouter(<SearchCourseCardWithAppContext {...propsForLoading} />);

    // assert <Skeleton /> loading components render to verify
    // course card is properly in a loading state.
    expect(container.getElementsByClassName('pgn__card-image-cap').length).toBe(1);
    expect(screen.getByTestId('course-title-loading'));
    expect(screen.getByTestId('partner-name-loading'));
    expect(screen.getByTestId('content-type-loading'));
  });
});
