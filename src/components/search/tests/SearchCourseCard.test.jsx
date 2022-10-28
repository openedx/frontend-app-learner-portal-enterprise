import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { renderHook } from '@testing-library/react-hooks';

import SearchCourseCard from '../SearchCourseCard';
import * as optimizelyUtils from '../../../utils/optimizely';
import * as courseSearchUtils from '../utils';

import { renderWithRouter } from '../../../utils/tests';
import { TEST_ENTERPRISE_SLUG, TEST_IMAGE_URL } from './constants';
import { useCourseAboutPageVisitClickHandler } from '../data/hooks';

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

  test('render course_length field in place of course text', () => {
    jest.spyOn(optimizelyUtils, 'isExperimentVariant').mockImplementation(() => true);
    jest.spyOn(courseSearchUtils, 'isShortCourse').mockImplementation(() => true);

    const { container } = renderWithRouter(<SearchCourseCardWithAppContext {...defaultProps} />);

    // assert that the card footer shows text "Short Course"
    expect(container.querySelector('.pgn__card-footer-text')).toHaveTextContent('Short Course');
  });

  test('do not render course_length field in place of course text', () => {
    jest.spyOn(optimizelyUtils, 'isExperimentVariant').mockImplementation(() => true);
    jest.spyOn(courseSearchUtils, 'isShortCourse').mockImplementation(() => false);

    const { container } = renderWithRouter(<SearchCourseCardWithAppContext {...defaultProps} />);

    // assert that the card footer shows text "Course"
    expect(container.querySelector('.pgn__card-footer-text')).toHaveTextContent('Course');
  });

  test('optimizely event is being triggered in onClick when search card is clicked', () => {
    const basicProps = {
      courseKey: 'course-key',
      enterpriseId: 'enterprise-id',
    };
    const pushEventSpy = jest.spyOn(optimizelyUtils, 'pushEvent').mockImplementation(() => (true));

    const { result } = renderHook(() => useCourseAboutPageVisitClickHandler(basicProps));
    result.current({ preventDefault: jest.fn() });

    const { container } = renderWithRouter(<SearchCourseCardWithAppContext {...defaultProps} />);

    // select card with class pgn__card and click on it
    const card = container.querySelector('.pgn__card');
    card.click();

    expect(pushEventSpy).toHaveBeenCalledWith('enterprise_learner_portal_course_about_page_click', {
      courseKey: 'course-key',
      enterpriseId: 'enterprise-id',
    });
  });
});
