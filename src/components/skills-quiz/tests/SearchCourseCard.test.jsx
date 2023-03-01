import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import SearchCourseCard from '../SearchCourseCard';

import { renderWithRouter } from '../../../utils/tests';
import { TEST_IMAGE_URL, TEST_ENTERPRISE_SLUG } from '../../search/tests/constants';
import { NO_COURSES_ALERT_MESSAGE } from '../constants';
import { SkillsContext } from '../SkillsContextProvider';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ username: 'myspace-tom' }),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('react-truncate', () => ({
  __esModule: true,
  default: ({ children }) => children,
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

const defaultAppState = {
  enterpriseConfig: {
    slug: 'test-enterprise-slug',
  },
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

const defaultCouponCodesState = {
  couponCodes: [],
  loading: false,
  couponCodesCount: 0,
};

const defaultUserSubsidyState = {
  couponCodes: defaultCouponCodesState,
};

const defaultSubsidyRequestState = {
  catalogsForSubsidyRequests: [],
};

const SearchCourseCardWithContext = ({
  initialAppState = defaultAppState,
  initialSkillsState = defaultSkillsState,
  initialUserSubsidyState = defaultUserSubsidyState,
  initialSubsidyRequestState = defaultSubsidyRequestState,
  searchContext = defaultSearchContext,
  index,
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <SubsidyRequestsContext.Provider value={initialSubsidyRequestState}>
        <SearchContext.Provider value={searchContext}>
          <SkillsContext.Provider value={initialSkillsState}>
            <SearchCourseCard index={index} />
          </SkillsContext.Provider>
        </SearchContext.Provider>
      </SubsidyRequestsContext.Provider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('<SearchCourseCard />', () => {
  test('renders the correct data', async () => {
    const { container, history } = renderWithRouter(
      <SearchCourseCardWithContext
        index={testIndex}
      />,
    );

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
    userEvent.click(searchCourseCard);
    expect(history.entries).toHaveLength(2);
    expect(history.location.pathname).toContain(`${TEST_ENTERPRISE_SLUG}/course/${TEST_COURSE_KEY}`);
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
