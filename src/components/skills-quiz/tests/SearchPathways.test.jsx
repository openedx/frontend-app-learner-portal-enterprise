import React from 'react';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SearchPathways from '../SearchPathways';
import { defaultSubsidyHooksData, mockSubsidyHooksReturnValues, renderWithRouter } from '../../../utils/tests';
import { TEST_ENTERPRISE_SLUG } from '../../search/tests/constants';
import { SkillsContext } from '../SkillsContextProvider';
import { useEnterpriseCustomer } from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useSubscriptions: jest.fn(),
  useRedeemablePolicies: jest.fn(),
  useCouponCodes: jest.fn(),
  useEnterpriseOffers: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useCatalogsForSubsidyRequests: jest.fn(),
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

const SearchPathwaysWithContext = ({
  initialSkillsState = defaultSkillsState,
  initialSearchContext = defaultSearchContext,
  index,
}) => (
  <IntlProvider locale="en">
    <SearchContext.Provider value={initialSearchContext}>
      <SkillsContext.Provider value={initialSkillsState}>
        <SearchPathways index={index} />
      </SkillsContext.Provider>
    </SearchContext.Provider>
  </IntlProvider>
);

const mockEnterpriseCustomer = {
  name: 'test-enterprise',
  slug: TEST_ENTERPRISE_SLUG,
  uuid: 'test-enterprise-uuid',
};

describe('<SearchPathways />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    mockSubsidyHooksReturnValues(defaultSubsidyHooksData);
  });

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
