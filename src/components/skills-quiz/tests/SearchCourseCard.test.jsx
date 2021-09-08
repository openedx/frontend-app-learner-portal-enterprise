import React from 'react';
import '@testing-library/jest-dom';
import { screen, act } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import SearchCourseCard from '../SearchCourseCard';

import { renderWithRouter } from '../../../utils/tests';
import { TEST_IMAGE_URL, TEST_ENTERPRISE_SLUG } from '../../search/tests/constants';
import { NO_COURSES_ALERT_MESSAGE } from '../constants';
import { SkillsContext } from '../SkillsContextProvider';

jest.mock('react-truncate', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('react-loading-skeleton', () => ({
  __esModule: true,
  // eslint-disable-next-line react/prop-types
  default: (props = {}) => <div data-testid={props['data-testid']} />,
}));

/* eslint-disable react/prop-types */
const SearchCourseCardWithContext = ({
  initialAppState,
  initialSkillsState,
  initialUserSubsidyState,
  searchContext,
  index,
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <SearchContext.Provider value={searchContext}>
        <SkillsContext.Provider value={initialSkillsState}>
          <SearchCourseCard index={index} />
        </SkillsContext.Provider>
      </SearchContext.Provider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

const TEST_COURSE_KEY = 'test-course-key';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMG_URL = 'http://fake.image';
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
      skill_names: [],
    },
  ],
  nbHits: 1,
};

const testIndex = {
  indexName: 'test-index-name',
  search: jest.fn().mockImplementation(() => Promise.resolve(courses)),
};

const initialAppState = {
  enterpriseConfig: {
    slug: 'test-enterprise-slug',
  },
};

const searchContext = {
  refinements: { skill_names: ['test-skill-1', 'test-skill-2'] },
  dispatch: () => null,
};

const initialSkillsState = {
  state: {
    goal: 'Goal',
    selectedJob: 'job-1',
    interestedJobs: [
      {
        name: 'job-1',
        skills: [
          {
            name: 'test-skill-3',
          },
        ],
      },
    ],
  },
};

const defaultOffersState = {
  offers: [],
  loading: false,
  offersCount: 0,
};

const initialUserSubsidyState = {
  hasAccessToPortal: true,
  offers: defaultOffersState,
};

describe('<SearchCourseCard />', () => {
  test('renders the correct data', async () => {
    let containerDOM = {};
    await act(async () => {
      const { container } = renderWithRouter(
        <SearchCourseCardWithContext
          initialAppState={initialAppState}
          initialSkillsState={initialSkillsState}
          initialUserSubsidyState={initialUserSubsidyState}
          index={testIndex}
          searchContext={searchContext}
        />,
      );
      containerDOM = container;
    });

    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();
    expect(screen.getByAltText(TEST_PARTNER.name)).toBeInTheDocument();

    expect(containerDOM.querySelector('.course-card-result > a')).toHaveAttribute(
      'href',
      `/${TEST_ENTERPRISE_SLUG}/course/${TEST_COURSE_KEY}`,
    );
    expect(containerDOM.querySelector('p.partner')).toHaveTextContent(TEST_PARTNER.name);
    expect(containerDOM.querySelector('.card-img-top')).toHaveAttribute('src', TEST_CARD_IMG_URL);
  });

  test('renders the correct data with skills', async () => {
    const skillNames = ['Research', 'Algorithms'];
    const coursesWithSkills = {
      hits: [
        {
          key: TEST_COURSE_KEY,
          title: TEST_TITLE,
          card_image_url: TEST_CARD_IMG_URL,
          partners: [TEST_PARTNER],
          skill_names: skillNames,
        },
      ],
      nbHits: 1,
    };
    const courseIndex = {
      indexName: 'test-index-name',
      search: jest.fn().mockImplementation(() => Promise.resolve(coursesWithSkills)),
    };
    await act(async () => {
      renderWithRouter(
        <SearchCourseCardWithContext
          initialAppState={initialAppState}
          initialSkillsState={initialSkillsState}
          initialUserSubsidyState={initialUserSubsidyState}
          index={courseIndex}
          searchContext={searchContext}
        />,
      );
    });
    expect(screen.getByText(skillNames[0])).toBeInTheDocument();
    expect(screen.getByText(skillNames[1])).toBeInTheDocument();
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
    await act(async () => {
      renderWithRouter(
        <SearchCourseCardWithContext
          initialAppState={initialAppState}
          initialSkillsState={initialSkillsState}
          initialUserSubsidyState={initialUserSubsidyState}
          index={courseIndex}
          searchContext={searchContext}
        />,
      );
    });
    expect(screen.getByText(NO_COURSES_ALERT_MESSAGE)).toBeTruthy();
  });
});
