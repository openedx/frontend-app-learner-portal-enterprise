import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';

import SearchCourseCard from '../SearchCourseCard';
import { renderWithRouter } from '../../../utils/tests';
import { TEST_IMAGE_URL } from '../../search/tests/constants';
import { NO_COURSES_ALERT_MESSAGE } from '../constants';
import { SkillsContext } from '../SkillsContextProvider';
import { useEnterpriseCustomer, useDefaultSearchFilters } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useDefaultSearchFilters: jest.fn(),
  useEnterpriseCustomer: jest.fn(),
}));

const TEST_COURSE_KEY = 'test-course-key';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMG_URL = 'https://fake.image';
const TEST_PARTNER = {
  name: 'Partner Name',
  logoImageUrl: TEST_IMAGE_URL,
};
const ADVERTISED_COURSE_RUN = 'course-v1:test-2020';
const courses = {
  hits: [
    {
      key: TEST_COURSE_KEY,
      title: TEST_TITLE,
      card_image_url: TEST_CARD_IMG_URL,
      partners: [TEST_PARTNER],
      skill_names: [],
      advertised_course_run: {
        key: ADVERTISED_COURSE_RUN,
      },
    },
  ],
  nbHits: 1,
};

const testIndex = {
  indexName: 'test-index-name',
  search: jest.fn().mockImplementation(() => Promise.resolve(courses)),
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

const defaultAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const defaultSearchContext = {
  refinements: {},
  dispatch: () => null,
};

const defaultSkillsState = {
  state: {
    goal: 'Goal',
    selectedJob: 'job-1',
    enrolledCourseIds: ['course-v1:test-2022'],
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

const SearchCourseCardWithContext = ({
  initialAppState = defaultAppState,
  initialSkillsState = defaultSkillsState,
  searchContext = defaultSearchContext,
  index,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SearchContext.Provider value={searchContext}>
        <SkillsContext.Provider value={initialSkillsState}>
          <SearchCourseCard index={index} />
        </SkillsContext.Provider>
      </SearchContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<SearchCourseCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useDefaultSearchFilters.mockReturnValue({ filters: `enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}` });
  });

  test('renders the correct data', async () => {
    const user = userEvent.setup();
    const { container } = renderWithRouter(<SearchCourseCardWithContext index={testIndex} />);
    const searchCourseCard = await screen.findByTestId('skills-quiz-course-card');
    expect(searchCourseCard).toBeInTheDocument();

    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();
    expect(screen.getByAltText(TEST_PARTNER.name)).toBeInTheDocument();
    expect(screen.getByText(TEST_PARTNER.name)).toBeInTheDocument();

    // should show both logo image and card image with proper URLs
    const cardImages = container.querySelectorAll('img');
    expect(cardImages).toHaveLength(2);
    cardImages.forEach((cardImg) => {
      expect(cardImg).toHaveAttribute('src', TEST_CARD_IMG_URL);
    });

    // handles click
    await user.click(searchCourseCard);
    expect(window.location.pathname).toEqual(`/${mockEnterpriseCustomer.slug}/course/${TEST_COURSE_KEY}`);
  });

  test('renders the correct data with skills', async () => {
    const skillNames = ['test-skill-1', 'test-skill-2'];
    const coursesWithSkills = {
      hits: [
        {
          key: TEST_COURSE_KEY,
          title: TEST_TITLE,
          card_image_url: TEST_CARD_IMG_URL,
          partners: [TEST_PARTNER],
          skill_names: skillNames,
          advertised_course_run: {
            key: ADVERTISED_COURSE_RUN,
          },
        },
      ],
      nbHits: 1,
    };
    const courseIndex = {
      indexName: 'test-index-name',
      search: jest.fn().mockImplementation(() => Promise.resolve(coursesWithSkills)),
    };
    renderWithRouter(
      <SearchCourseCardWithContext
        index={courseIndex}
      />,
    );
    expect(await screen.findByText(skillNames[0])).toBeInTheDocument();
    expect(screen.getByText(skillNames[1])).toBeInTheDocument();
  });

  test('only show course skills that match job-skills', async () => {
    const irrelevantSkill = 'test-skills-3';
    const skillNames = ['test-skill-1', 'test-skill-2'];
    skillNames.push(irrelevantSkill);
    const coursesWithSkills = {
      hits: [
        {
          key: TEST_COURSE_KEY,
          title: TEST_TITLE,
          card_image_url: TEST_CARD_IMG_URL,
          partners: [TEST_PARTNER],
          skill_names: skillNames,
          advertised_course_run: {
            key: ADVERTISED_COURSE_RUN,
          },
        },
      ],
      nbHits: 1,
    };
    const courseIndex = {
      indexName: 'test-index-name',
      search: jest.fn().mockImplementation(() => Promise.resolve(coursesWithSkills)),
    };
    renderWithRouter(
      <SearchCourseCardWithContext
        index={courseIndex}
      />,
    );
    expect(await screen.findByText(skillNames[0])).toBeInTheDocument();
    expect(screen.getByText(skillNames[1])).toBeInTheDocument();
    expect(screen.queryByText(irrelevantSkill)).not.toBeInTheDocument();
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
      <SearchCourseCardWithContext
        index={courseIndex}
      />,
    );
    expect(await screen.findByText(NO_COURSES_ALERT_MESSAGE)).toBeInTheDocument();
  });

  test('renders the recommended courses without already enrolled courses', async () => {
    const skillNames = ['test-skill-1', 'test-skill-2'];
    const coursesWithSkills = {
      hits: [
        {
          key: TEST_COURSE_KEY,
          title: TEST_TITLE,
          card_image_url: TEST_CARD_IMG_URL,
          partners: [TEST_PARTNER],
          skill_names: skillNames,
          advertised_course_run: {
            key: ADVERTISED_COURSE_RUN,
          },
        },
        {
          key: 'test-course-key-two',
          title: 'Test Title Two',
          card_image_url: TEST_CARD_IMG_URL,
          partners: [TEST_PARTNER],
          skill_names: skillNames,
          advertised_course_run: {
            key: 'course-v1:test-2021',
          },
        },
        {
          key: 'test-course-key-three',
          title: 'Test Title Three',
          card_image_url: TEST_CARD_IMG_URL,
          partners: [TEST_PARTNER],
          skill_names: skillNames,
          advertised_course_run: {
            key: 'course-v1:test-2022',
          },
        },
      ],
      nbHits: 3,
    };
    const courseIndex = {
      indexName: 'test-index-name',
      search: jest.fn().mockImplementation(() => Promise.resolve(coursesWithSkills)),
    };
    renderWithRouter(
      <SearchCourseCardWithContext
        index={courseIndex}
      />,
    );
    expect(await screen.findByText(TEST_TITLE)).toBeInTheDocument();
    expect(screen.getByText('Test Title Two')).toBeInTheDocument();
    expect(screen.queryByText('Test Title Three')).not.toBeInTheDocument();
  });
});
