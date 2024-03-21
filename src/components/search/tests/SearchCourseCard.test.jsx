import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import SearchCourseCard from '../SearchCourseCard';
import * as courseSearchUtils from '../utils';

import { renderWithRouter } from '../../../utils/tests';
import { TEST_ENTERPRISE_SLUG, TEST_IMAGE_URL } from './constants';
import { useEnterpriseCustomer } from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const initialAppState = {
  authenticatedUser: { userId: 'test-user-id', username: 'test-username' },
};

const SearchCourseCardWithAppContext = (props) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SearchCourseCard {...props} />
    </AppContext.Provider>
  </IntlProvider>
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

const mockEnterpriseCustomer = {
  name: 'test-enterprise',
  slug: 'test-enterprise-slug',
  uuid: 'test-enterprise-uuid',
};

describe('<SearchCourseCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });

    // reset the router history between tests
    beforeEach(() => {
      window.history.pushState({}, '', '/');
    });
  });

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
    renderWithRouter(<SearchCourseCardWithAppContext {...defaultProps} />);
    const cardEl = screen.getByTestId('search-course-card');
    userEvent.click(cardEl);
    expect(window.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}/course/${TEST_COURSE_KEY}`);
  });

  test('renders the loading state', () => {
    const { container } = renderWithRouter(<SearchCourseCardWithAppContext {...propsForLoading} />);

    // ensure `Card` was passed `isLoading` by asserting each `Card` subcomponent
    // is treated as a skeleton instead, indicated by `aria-busy="true"`.
    expect(container.querySelectorAll('[aria-busy="true"]')).toHaveLength(4);

    // does not do anything when clicked
    const cardEl = screen.getByTestId('search-course-card');
    userEvent.click(cardEl);
    expect(window.location.pathname).toEqual('/');
  });

  test('render course_length field in place of course text', () => {
    jest.spyOn(courseSearchUtils, 'isShortCourse').mockImplementation(() => true);

    const { container } = renderWithRouter(<SearchCourseCardWithAppContext {...defaultProps} />);

    // assert that the card footer shows text "Short Course"
    expect(container.querySelector('.pgn__card-footer-text')).toHaveTextContent('Short Course');
  });

  test('do not render course_length field in place of course text', () => {
    jest.spyOn(courseSearchUtils, 'isShortCourse').mockImplementation(() => false);

    const { container } = renderWithRouter(<SearchCourseCardWithAppContext {...defaultProps} />);

    // assert that the card footer shows text "Course"
    expect(container.querySelector('.pgn__card-footer-text')).toHaveTextContent('Course');
  });
});
