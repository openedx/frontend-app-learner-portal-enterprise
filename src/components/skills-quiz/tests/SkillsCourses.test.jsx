/* eslint-disable react/prop-types */
import React from 'react';
import '@testing-library/jest-dom';
import { screen, act, waitFor } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import SkillsCourses from '../SkillsCourses';

import { renderWithRouter } from '../../../utils/tests';
import { TEST_IMAGE_URL } from '../../search/tests/constants';
import { NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS } from '../constants';
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

const defaultAppState = {
  enterpriseConfig: {
    slug: 'test-enterprise-slug',
  },
};

const defaultSearchContext = {
  refinements: { skill_names: ['test-skill-3'] },
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

const SkillsCoursesWithContext = ({
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
            <SkillsCourses index={index} />
          </SkillsContext.Provider>
        </SearchContext.Provider>
      </SubsidyRequestsContext.Provider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('<SkillsCourses />', () => {
  test('renders the correct data', async () => {
    const { container } = renderWithRouter(
      <SkillsCoursesWithContext
        index={testIndex}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(SKILLS_HEADING)).toBeInTheDocument();
      expect(screen.getByAltText(TEST_PARTNER.name)).toBeInTheDocument();
    });

    // expect(screen.querySelector('.search-result-card > a')).toHaveAttribute(
    //   'href',
    //   `/${TEST_ENTERPRISE_SLUG}/course/${TEST_COURSE_KEY}`,
    // );

    expect(screen.getByText(TEST_PARTNER.name)).toBeInTheDocument();
    // should show both logo image and card image with proper URLs
    const cardImages = container.querySelectorAll('img');
    expect(cardImages).toHaveLength(2);
    cardImages.forEach((cardImg) => {
      expect(cardImg).toHaveAttribute('src', TEST_CARD_IMG_URL);
    });
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
        <SkillsCoursesWithContext
          index={courseIndex}
        />,
      );
    });
    expect(screen.getByText(NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS)).toBeTruthy();
  });
});
