import React from 'react';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '../../../utils/tests';
import { TEST_IMAGE_URL, TEST_ENTERPRISE_SLUG } from '../../search/tests/constants';
import { CourseContext } from '../CourseContextProvider';
import CourseRecommendations from '../CourseRecommendations';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
  hasFeatureFlagEnabled: jest.fn(),
}));

jest.mock('react-truncate', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

const TEST_UUID = '1234053423-4212-21323-45fdf';
const initialAppState = {
  enterpriseConfig: {
    slug: TEST_ENTERPRISE_SLUG,
    uuid: TEST_UUID,
  },
};

const TEST_COURSE_KEY = 'test-course-key';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMG_URL = 'http://fake.image';
const TEST_OWNER = {
  name: 'Partner Name',
  logoImageUrl: TEST_IMAGE_URL,
};

const course = {
  key: TEST_COURSE_KEY,
  title: TEST_TITLE,
  cardImageUrl: { src: TEST_CARD_IMG_URL },
  owners: [TEST_OWNER],
};

const initialCourseState = {
  state: {
    course: {
      owners: [TEST_OWNER],
    },
    courseRecommendations: {
      allRecommendations: [course],
      samePartnerRecommendations: [course],
    },
  },
};

const CourseRecommendationsWithContext = () => (
  <AppContext.Provider value={initialAppState}>
    <CourseContext.Provider value={initialCourseState}>
      <CourseRecommendations />
    </CourseContext.Provider>
  </AppContext.Provider>
);

describe('<CourseRecommendations />', () => {
  test('renders the correct data', () => {
    renderWithRouter(<CourseRecommendationsWithContext />);
    expect(screen.getByText('Courses you may like:')).toBeInTheDocument();
    expect(screen.getByText(`More from ${TEST_OWNER.name}:`)).toBeInTheDocument();
    expect(screen.getAllByText(course.title).length).toBe(2);
    expect(screen.getAllByAltText(TEST_OWNER.name).length).toBe(2);
  });
});
