import { AppContext } from '@edx/frontend-platform/react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { SkillsContextProvider } from '../SkillsContextProvider';
import SelectJobCard from '../SelectJobCard';
import { NOT_AVAILABLE } from '../constants';
import { useEnterpriseCustomer } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const initialAppState = {
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
};

const SelectJobCardWithContext = ({
  initialJobCardState = {},
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SearchContext.Provider value={{}}>
        <SkillsContextProvider initialState={initialJobCardState}>
          <SelectJobCard />
        </SkillsContextProvider>
      </SearchContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

const TEST_MEDIAN_SALARY = '100000';
const TEST_MEDIAN_SALARY_2 = '250000';
const TEST_UNIQUE_POSTINGS = '45';
const TEST_UNIQUE_POSTINGS_2 = '500';
const TRANSFORMED_MEDIAN_SALARY = '$100,000';
const TRANSFORMED_MEDIAN_SALARY_2 = '$250,000';
const MEDIAN_SALARY = 'Median U.S. Salary:';
const JOB_POSTINGS = 'Job Postings:';

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCustomerWithHiddenLaborMarketData = enterpriseCustomerFactory({
  hide_labor_market_data: true,
});

describe('<SelectJobCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  test('renders job card', () => {
    const initialJobCardState = {
      interestedJobs: [{
        name: 'TEST_JOB_TITLE',
        objectID: 'TEST_JOB_KEY',
        jobPostings: [
          {
            medianSalary: TEST_MEDIAN_SALARY,
            uniquePostings: TEST_UNIQUE_POSTINGS,
          },
        ],

      },
      ],
    };
    renderWithRouter(
      <SelectJobCardWithContext
        initialAppState={initialAppState}
        initialJobCardState={initialJobCardState}
      />,
    );
    expect(screen.queryByText(initialJobCardState.interestedJobs[0].name)).toBeInTheDocument();
    expect(screen.queryByText(TRANSFORMED_MEDIAN_SALARY)).toBeInTheDocument();
    expect(screen.queryByText(TEST_UNIQUE_POSTINGS)).toBeInTheDocument();
  });

  test('does not render salary data when hideLaborMarketData is true', () => {
    const initialJobCardState = {
      interestedJobs: [{
        name: 'TEST_JOB_TITLE',
        objectID: 'TEST_JOB_KEY',
        jobPostings: [
          {
            medianSalary: TEST_MEDIAN_SALARY,
            uniquePostings: TEST_UNIQUE_POSTINGS,
          },
        ],

      },
      ],
    };
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithHiddenLaborMarketData });
    renderWithRouter(
      <SelectJobCardWithContext
        initialAppState={initialAppState}
        initialJobCardState={initialJobCardState}
      />,
    );
    expect(screen.queryByText(initialJobCardState.interestedJobs[0].name)).toBeInTheDocument();
    expect(screen.queryByText(TRANSFORMED_MEDIAN_SALARY)).not.toBeInTheDocument();
    expect(screen.queryByText(TEST_UNIQUE_POSTINGS)).not.toBeInTheDocument();
  });

  test('renders multiple job card', () => {
    const initialJobCardState = {
      interestedJobs: [{
        name: 'Engineer',
        objectID: '11',
        jobPostings: [
          {
            medianSalary: TEST_MEDIAN_SALARY,
            uniquePostings: TEST_UNIQUE_POSTINGS,
          },
        ],

      },
      {
        name: 'Programmer',
        objectID: '12',
        jobPostings: [
          {
            medianSalary: TEST_MEDIAN_SALARY_2,
            uniquePostings: TEST_UNIQUE_POSTINGS_2,
          },
        ],

      },
      ],
    };
    renderWithRouter(
      <SelectJobCardWithContext
        initialJobCardState={initialJobCardState}
      />,
    );
    expect(screen.queryByText(initialJobCardState.interestedJobs[0].name)).toBeInTheDocument();
    expect(screen.queryByText(TRANSFORMED_MEDIAN_SALARY)).toBeInTheDocument();
    expect(screen.queryByText(TEST_UNIQUE_POSTINGS)).toBeInTheDocument();
    expect(screen.queryByText(initialJobCardState.interestedJobs[1].name)).toBeInTheDocument();
    expect(screen.queryByText(TRANSFORMED_MEDIAN_SALARY_2)).toBeInTheDocument();
    expect(screen.queryByText(TEST_UNIQUE_POSTINGS_2)).toBeInTheDocument();
  });

  test('renders multiple job cards without unique job postings', () => {
    const initialJobCardStateWithOutJobs = {
      interestedJobs: [{
        name: 'Engineer',
        objectID: '11',
        jobPostings: [
          {
            medianSalary: TEST_MEDIAN_SALARY,
          },
        ],
      },
      ],
    };
    renderWithRouter(
      <SelectJobCardWithContext
        initialJobCardState={initialJobCardStateWithOutJobs}
      />,
    );
    expect(screen.queryByText(initialJobCardStateWithOutJobs.interestedJobs[0].name)).toBeInTheDocument();
    expect(screen.queryByText(NOT_AVAILABLE)).toBeVisible();
    expect(screen.queryByText(MEDIAN_SALARY)).toBeInTheDocument();
    expect(screen.queryByText(TRANSFORMED_MEDIAN_SALARY)).toBeInTheDocument();
    expect(screen.queryByText(JOB_POSTINGS)).toBeInTheDocument();
  });

  test('renders multiple job card without median salary', () => {
    const initialJobCardStateWithOutSalary = {
      interestedJobs: [{
        name: 'Engineer',
        objectID: '11',
        jobPostings: [
          {
            uniquePostings: TEST_UNIQUE_POSTINGS,
          },
        ],
      },
      ],
    };
    renderWithRouter(
      <SelectJobCardWithContext
        initialJobCardState={initialJobCardStateWithOutSalary}
      />,
    );
    expect(screen.queryByText(initialJobCardStateWithOutSalary.interestedJobs[0].name)).toBeInTheDocument();
    expect(screen.queryByText(JOB_POSTINGS)).toBeInTheDocument();
    expect(screen.queryByText(MEDIAN_SALARY)).toBeInTheDocument();
    expect(screen.queryByText(TEST_UNIQUE_POSTINGS)).toBeVisible();
    expect(screen.queryByText(NOT_AVAILABLE)).toBeVisible();
  });

  test('renders no job card', () => {
    const initialJobCardState = {
      interestedJobs: [],
    };
    renderWithRouter(
      <SelectJobCardWithContext
        initialJobCardState={initialJobCardState}
      />,
    );

    expect(screen.queryByRole('Card')).toBe(null);
  });
});
