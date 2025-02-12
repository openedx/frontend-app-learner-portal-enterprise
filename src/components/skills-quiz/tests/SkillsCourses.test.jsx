import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SkillsCourses from '../SkillsCourses';
import { renderWithRouter } from '../../../utils/tests';
import { TEST_IMAGE_URL } from '../../search/tests/constants';
import { NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS } from '../constants';
import { SkillsContext } from '../SkillsContextProvider';
import { useEnterpriseCustomer, useDefaultSearchFilters } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useDefaultSearchFilters: jest.fn(),
}));

const TEST_COURSE_KEY = 'test-course-key';
const SKILLS_HEADING = 'Skills';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMG_URL = 'https://fake.image';
const TEST_PARTNER = {
  name: 'Partner Name',
  logo_image_url: TEST_IMAGE_URL,
};

const courses = {
  hits: [
    {
      key: TEST_COURSE_KEY,
      title: TEST_TITLE,
      card_image_url: TEST_CARD_IMG_URL,
      partners: [TEST_PARTNER],
      skill_names: ['test-skill-1'],
    },
  ],
  nbHits: 1,
};

const testIndex = {
  indexName: 'test-index-name',
  search: jest.fn().mockImplementation(() => Promise.resolve(courses)),
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const defaultAppState = {
  authenticatedUser: {
    username: 'myspace-tom',
  },
};

const defaultSearchContext = {
  refinements: { },
  dispatch: () => null,
};

const defaultSkillsState = {
  state: {
    goal: 'Goal',
    selectedJob: 'job-1',
    interestedJobs: [
      {
        name: 'job-1',
        skills: [
          {
            name: 'test-skill-1',
          },
          {
            name: 'test-skill-2',
          },
        ],
      },
    ],
  },
};

const SkillsCoursesWithContext = ({
  initialAppState = defaultAppState,
  initialSkillsState = defaultSkillsState,
  searchContext = defaultSearchContext,
  index,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SearchContext.Provider value={searchContext}>
        <SkillsContext.Provider value={initialSkillsState}>
          <SkillsCourses index={index} />
        </SkillsContext.Provider>
      </SearchContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<SkillsCourses />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useDefaultSearchFilters.mockReturnValue({ filters: `enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}` });
  });

  test('renders the correct data', async () => {
    const user = userEvent.setup();
    const { container } = renderWithRouter(<SkillsCoursesWithContext index={testIndex} />);

    await waitFor(() => {
      expect(screen.getByText(SKILLS_HEADING)).toBeInTheDocument();
      expect(screen.getByAltText(TEST_PARTNER.name)).toBeInTheDocument();
    });

    expect(screen.getByText(TEST_PARTNER.name)).toBeInTheDocument();
    // should show both logo image and card image with proper URLs
    const cardImages = container.querySelectorAll('img');
    expect(cardImages).toHaveLength(2);
    cardImages.forEach((cardImg) => {
      expect(cardImg).toHaveAttribute('src', TEST_CARD_IMG_URL);
    });

    await user.click(screen.getByTestId('skills-quiz-course-card'));
    expect(window.location.pathname).toContain(`/${mockEnterpriseCustomer.slug}/course/${TEST_COURSE_KEY}`);
  });

  test('renders an alert in case of no courses returned', async () => {
    const noCourses = {
      hits: [],
      nbHits: 0,
    };
    const courseIndex = {
      indexName: 'test-index-name',
      search: jest.fn().mockImplementation(() => Promise.resolve(noCourses)),
    };
    renderWithRouter(
      <SkillsCoursesWithContext
        index={courseIndex}
      />,
    );
    expect(await screen.findByText(NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS)).toBeInTheDocument();
  });
});
