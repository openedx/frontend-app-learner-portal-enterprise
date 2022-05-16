import React from 'react';
import '@testing-library/jest-dom';
import { screen, act } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import SearchPathways from '../SearchPathways';
import { renderWithRouter } from '../../../utils/tests';
import { TEST_ENTERPRISE_SLUG } from '../../search/tests/constants';
import { SkillsContext } from '../SkillsContextProvider';

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

jest.mock('react-loading-skeleton', () => ({
  __esModule: true,
  // eslint-disable-next-line react/prop-types
  default: (props = {}) => <div data-testid={props['data-testid']} />,
}));

/* eslint-disable react/prop-types */
const SearchPathwaysWithContext = ({
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
          <SearchPathways index={index} />
        </SkillsContext.Provider>
      </SearchContext.Provider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

const TEST_PATHWAY_UUID = 'test-pathway-uuid';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMAGE_URL = 'http://fake.image';

const TEST_PATHWAY = {
  aggregation_key: `learner_pathway:${TEST_PATHWAY_UUID}`,
  title: TEST_TITLE,
  card_image_url: TEST_CARD_IMAGE_URL,
};

const pathways = {
  hits: [TEST_PATHWAY],
  nbHits: 1,
};

const testIndex = {
  indexName: 'test-index-name',
  search: jest.fn().mockImplementation(() => Promise.resolve(pathways)),
};

const initialAppState = {
  enterpriseConfig: {
    slug: TEST_ENTERPRISE_SLUG,
    uuid: '5d3v5ee2-761b-49b4-8f47-f6f51589d815',
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

const defaultOffersState = {
  offers: [],
  loading: false,
  offersCount: 0,
};

const initialUserSubsidyState = {
  offers: defaultOffersState,
};

describe('<SearchPathways />', () => {
  test('renders the correct data', async () => {
    let containerDOM = {};
    await act(async () => {
      const { container } = renderWithRouter(
        <SearchPathwaysWithContext
          initialAppState={initialAppState}
          initialSkillsState={initialSkillsState}
          initialUserSubsidyState={initialUserSubsidyState}
          index={testIndex}
          searchContext={searchContext}
        />,
      );
      containerDOM = container;
    });
    expect(screen.getByText('Get started with these pathways')).toBeInTheDocument();
    expect(containerDOM.querySelector('.search-pathway-card')).toBeInTheDocument();
    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();
  });

  test('renders the correct data with skills', async () => {
    const skillNames = ['test-skill-1', 'test-skill-2'];
    const pathwaysWithSkills = {
      hits: [
        { ...TEST_PATHWAY, skill_names: skillNames },
      ],
      nbHits: 1,
    };
    const pathwayIndex = {
      indexName: 'test-index-name',
      search: jest.fn().mockImplementation(() => Promise.resolve(pathwaysWithSkills)),
    };
    await act(async () => {
      renderWithRouter(
        <SearchPathwaysWithContext
          initialAppState={initialAppState}
          initialSkillsState={initialSkillsState}
          initialUserSubsidyState={initialUserSubsidyState}
          index={pathwayIndex}
          searchContext={searchContext}
        />,
      );
    });
    expect(screen.getByText(skillNames[0])).toBeInTheDocument();
    expect(screen.getByText(skillNames[1])).toBeInTheDocument();
  });

  test('renders nothing in case of no pathways returned', async () => {
    const noPathways = {
      hits: [],
      nbHits: 0,
    };
    const pathwayIndex = {
      indexName: 'test-index-name',
      search: jest.fn().mockImplementation(() => Promise.resolve(noPathways)),
    };
    let containerDOM = {};
    await act(async () => {
      const { container } = renderWithRouter(
        <SearchPathwaysWithContext
          initialAppState={initialAppState}
          initialSkillsState={initialSkillsState}
          initialUserSubsidyState={initialUserSubsidyState}
          index={pathwayIndex}
          searchContext={searchContext}
        />,
      );
      containerDOM = container;
    });
    expect(screen.queryByText('Get started with these pathways')).not.toBeInTheDocument();
    expect(containerDOM.querySelector('.search-pathway-card')).not.toBeInTheDocument();
  });
});
