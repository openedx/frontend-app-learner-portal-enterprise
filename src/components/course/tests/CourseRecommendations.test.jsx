import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { renderWithRouter } from '../../../utils/tests';
import { TEST_IMAGE_URL } from '../../search/tests/constants';
import { CourseContext } from '../CourseContextProvider';
import CourseRecommendations from '../CourseRecommendations';
import { useCourseMetadata, useCourseRecommendations, useEnterpriseCustomer } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
  hasFeatureFlagEnabled: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useCourseRecommendations: jest.fn(),
  useCourseMetadata: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();

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

const defaultCourseState = {
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

const mockAuthenticatedUser = authenticatedUserFactory();

const CourseRecommendationsWithContext = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
      <CourseContext.Provider value={defaultCourseState}>
        <CourseRecommendations />
      </CourseContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<CourseRecommendations />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useCourseRecommendations.mockReturnValue({
      data: {
        allRecommendations: [course],
        samePartnerRecommendations: [course],
      },
    });
    useCourseMetadata.mockReturnValue({ data: course });
  });
  test('renders the correct data', () => {
    renderWithRouter(<CourseRecommendationsWithContext />);
    expect(screen.getByText('Courses you may like:')).toBeInTheDocument();
    expect(screen.getByText(`More from ${TEST_OWNER.name}:`)).toBeInTheDocument();
    expect(screen.getAllByText(course.title).length).toBe(2);
    expect(screen.getAllByAltText(TEST_OWNER.name).length).toBe(2);
  });
});
