import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import * as hooks from '../data/hooks';
import { renderWithRouter } from '../../../utils/tests';
import MyCareerTab from '../MyCareerTab';
import {
  useAlgoliaSearch,
  useDefaultSearchFilters,
  useEnterpriseCourseEnrollments,
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

jest.mock('plotly.js-dist', () => {});

jest.mock('../data/hooks', () => ({
  usePlotlySpiderChart: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useLearnerSkillLevels: jest.fn(),
  useIsAssignmentsOnlyLearner: jest.fn(),
  useDefaultSearchFilters: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
  useAlgoliaSearch: jest.fn(),
}));

hooks.usePlotlySpiderChart.mockReturnValue({});

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

const MyCareerTabWithContext = ({
  learnerCurrentJobID = 27,
  initialAppState = defaultAppState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <MyCareerTab learnerCurrentJobID={learnerCurrentJobID} />
    </AppContext.Provider>
  </IntlProvider>
);

describe('<MyCareerTab />', () => {
  global.URL.createObjectURL = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useLearnerSkillLevels.mockReturnValue({ data: mockLearnerSkillsData });
    useIsAssignmentsOnlyLearner.mockReturnValue(false);
    useDefaultSearchFilters.mockReturnValue({ filters: `enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}` });
    useEnterpriseCourseEnrollments.mockReturnValue({
      data: {
        allEnrollmentsByStatus: {
          inProgress: [{
            courseRunId: 'edx+Demo',
          }],
          upcoming: [],
          completed: [],
          savedForLater: [],
          requested: [],
          assigned: [],
        },
      },
    });
    useAlgoliaSearch.mockReturnValue({
      searchClient: {
        search: jest.fn(), appId: 'test-app-id',
      },
      searchIndex: {
        indexName: 'mock-index-name',
      },
    });
  });

  it('renders the VisualizeCareer component when learner has a current job', () => {
    renderWithRouter(<MyCareerTabWithContext />);
    const readingInstructionsButton = screen.getByTestId(
      'reading-instructions-button',
    );
    readingInstructionsButton.click();
  });

  it('renders the AddJobRole when learner doesnt have any current job', () => {
    useLearnerSkillLevels.mockReturnValue({ data: { skillCategories: [] } });
    renderWithRouter(<MyCareerTabWithContext learnerCurrentJobID={null} />);
    expect(screen.getByRole('button', { name: 'Add Role', exact: false })).toBeInTheDocument();
  });

  it('renders the ErrorPage component when there is problem loading data', () => {
    useLearnerSkillLevels.mockReturnValue({ data: null, error: { status: 'Error loading data' } });
    renderWithRouter(<MyCareerTabWithContext />);
    expect(screen.getByTestId('error-page')).toBeInTheDocument();
  });
});
