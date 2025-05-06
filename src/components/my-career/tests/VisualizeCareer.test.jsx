import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';

import * as hooks from '../data/hooks';
import { renderWithRouter } from '../../../utils/tests';
import VisualizeCareer from '../VisualizeCareer';
import {
  useAlgoliaSearch,
  useDefaultSearchFilters,
  useEnterpriseCustomer,
  useIsAssignmentsOnlyLearner,
  useLearnerSkillLevels,
} from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
  getMessages: () => ({}),
}));

jest.mock('plotly.js-dist', () => { });

jest.mock('../data/hooks', () => ({
  usePlotlySpiderChart: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useLearnerSkillLevels: jest.fn(),
  useIsAssignmentsOnlyLearner: jest.fn(),
  useDefaultSearchFilters: jest.fn(),
  useAlgoliaSearch: jest.fn(),
}));

hooks.usePlotlySpiderChart.mockReturnValue({
  data: [
    {
      type: 'scatterpolar',
      r: [0, 0, 0, 0, 0, 0],
      theta: [
        'Query Languages',
        'MongoDB',
        'Technology Roadmap',
        'Sprint Planning',
        'Blocker Resolution',
        'Technical Communication',
      ],
      fill: 'toself',
      name: 'You',
    },
    {
      type: 'scatterpolar',
      r: [0, 0, 0, 0, 0, 0],
      theta: [
        'Query Languages',
        'MongoDB',
        'Technology Roadmap',
        'Sprint Planning',
        'Blocker Resolution',
        'Technical Communication',
      ],
      fill: 'toself',
      name: 'Career Path',
    },
  ],
  layout: {
    polar: {
      radialaxis: {
        visible: true,
        range: [0, 5],
      },
    },
    showlegend: true,
  },
  config: {
    displayModeBar: false,
  },
});

const mockLearnerSkillsData = {
  id: 27,
  name: 'Applications developer',
  skillCategories: [
    {
      id: 1,
      name: 'Information Technology',
      skills: [
        { id: 78, name: 'Query Languages', score: null },
        { id: 79, name: 'MongoDB', score: null },
        { id: 81, name: 'Technology Roadmap', score: null },
        { id: 83, name: 'Sprint Planning', score: null },
        { id: 84, name: 'Blocker Resolution', score: null },
        { id: 85, name: 'Technical Communication', score: null },
      ],
      skillsSubcategories: [
        {
          id: 1,
          name: 'Databases',
          skills: [
            { id: 78, name: 'Query Languages', score: null },
            { id: 79, name: 'MongoDB', score: null },
          ],
        },
        {
          id: 2,
          name: 'IT Management',
          skills: [
            { id: 81, name: 'Technology Roadmap', score: null },
            { id: 83, name: 'Sprint Planning', score: null },
            { id: 84, name: 'Blocker Resolution', score: null },
            { id: 85, name: 'Technical Communication', score: null },
          ],
        },
      ],
      userScore: 0,
      edxAverageScore: null,
    },
    {
      id: 2,
      name: 'Business',
      skills: [
        { id: 80, name: 'Need Assesment', score: null },
        { id: 82, name: 'Comprehension', score: null },
      ],
      skillsSubcategories: [
        {
          id: 6,
          name: 'Sales',
          skills: [{ id: 80, name: 'Need Assesment', score: null }],
        },
        {
          id: 7,
          name: 'Communication',
          skills: [{ id: 82, name: 'Comprehension', score: null }],
        },
      ],
      userScore: 0,
      edxAverageScore: null,
    },
  ],
};

// eslint-disable-next-line no-console
console.error = jest.fn();

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

const defaultAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const defaultSearchContext = {
  refinements: { skill_names: ['test-skill-1', 'test-skill-2'] },
  dispatch: () => null,
};

const VisualizeCareerWithContext = ({
  initialAppState = defaultAppState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SearchContext.Provider value={defaultSearchContext}>
        <VisualizeCareer jobId={27} />
      </SearchContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<VisualizeCareer />', () => {
  global.URL.createObjectURL = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useLearnerSkillLevels.mockReturnValue({ data: mockLearnerSkillsData });
    useIsAssignmentsOnlyLearner.mockReturnValue(false);
    useDefaultSearchFilters.mockReturnValue(`enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}`);
    useAlgoliaSearch.mockReturnValue({
      searchClient: {
        search: jest.fn(), appId: 'test-app-id',
      },
      searchIndex: {
        indexName: 'mock-index-name',
      },
    });
  });

  it('renders the VisualizeCareer component', () => {
    renderWithRouter(<VisualizeCareerWithContext />);
    const readingInstructionsButton = screen.getByTestId('reading-instructions-button');
    readingInstructionsButton.click();
  });

  it('renders the LoadingSpinner component when data is not loaded yet', () => {
    useLearnerSkillLevels.mockReturnValue({ data: null, isLoading: true });
    renderWithRouter(<VisualizeCareerWithContext />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the ErrorPage component when there is problem loading data', () => {
    useLearnerSkillLevels.mockReturnValue({ error: { status: 500 } });
    renderWithRouter(<VisualizeCareerWithContext />);
    expect(screen.getByTestId('error-page')).toBeInTheDocument();
  });
});
