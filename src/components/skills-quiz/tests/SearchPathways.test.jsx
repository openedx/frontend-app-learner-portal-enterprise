import React from 'react';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import SearchPathways from '../SearchPathways';
import { renderWithRouter } from '../../../utils/tests';
import { TEST_ENTERPRISE_SLUG } from '../../search/tests/constants';
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

const TEST_PATHWAY_UUID = 'test-pathway-uuid';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMAGE_URL = 'http://fake.image';

const TEST_PATHWAY = {
  uuid: TEST_PATHWAY_UUID,
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

const defaultAppState = {
  enterpriseConfig: {
    slug: TEST_ENTERPRISE_SLUG,
    uuid: '5d3v5ee2-761b-49b4-8f47-f6f51589d815',
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

const SearchPathwaysWithContext = ({
  initialAppState = defaultAppState,
  initialSkillsState = defaultSkillsState,
  initialUserSubsidyState = defaultUserSubsidyState,
  initialSubsidyRequestState = defaultSubsidyRequestState,
  initialSearchContext = defaultSearchContext,
  index,
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <SubsidyRequestsContext.Provider value={initialSubsidyRequestState}>
        <SearchContext.Provider value={initialSearchContext}>
          <SkillsContext.Provider value={initialSkillsState}>
            <SearchPathways index={index} />
          </SkillsContext.Provider>
        </SearchContext.Provider>
      </SubsidyRequestsContext.Provider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('<SearchPathways />', () => {
  test('renders the correct data', async () => {
    renderWithRouter(<SearchPathwaysWithContext index={testIndex} />);
    await waitFor(() => {
      expect(screen.getByText('Get started with these pathways')).toBeInTheDocument();
      expect(screen.getByTestId('search-pathway-card')).toBeInTheDocument();
      expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();
    });
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
    renderWithRouter(
      <SearchPathwaysWithContext
        index={pathwayIndex}
      />,
    );
    expect(await screen.findByText(skillNames[0])).toBeInTheDocument();
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
    const { container } = renderWithRouter(
      <SearchPathwaysWithContext
        index={pathwayIndex}
      />,
    );
    expect(await screen.findByText('Get started with these pathways')).not.toBeInTheDocument();
    expect(container.querySelector('.search-pathway-card')).not.toBeInTheDocument();
  });
});
