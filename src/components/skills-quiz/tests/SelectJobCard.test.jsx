import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Factory } from 'rosie';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { camelCaseObject } from '@edx/frontend-platform';
import { SkillsContextProvider } from '../SkillsContextProvider';
import SelectJobCard from '../SelectJobCard';
import { NOT_AVAILABLE } from '../constants';
import { useEnterpriseCustomer } from '../../app/data';

const SelectJobCardWithContext = ({
  initialJobCardState = {},
  initialAppState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SearchContext.Provider>
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

const mockEnterpriseCustomer = camelCaseObject(Factory.build('enterpriseCustomer'));

const initialAppState = {
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
};

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

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
        job_postings: [
          {
            median_salary: TEST_MEDIAN_SALARY,
            unique_postings: TEST_UNIQUE_POSTINGS,
          },
        ],

      },
      ],
    };
    render(
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
        job_postings: [
          {
            median_salary: TEST_MEDIAN_SALARY,
            unique_postings: TEST_UNIQUE_POSTINGS,
          },
        ],

      },
      ],
    };
    const mockEnterpriseCustomerWithHiddenLaborMarketData = camelCaseObject(Factory.build('enterpriseCustomer', {
      hide_labor_market_data: true,
    }));
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithHiddenLaborMarketData });
    render(
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
        job_postings: [
          {
            median_salary: TEST_MEDIAN_SALARY,
            unique_postings: TEST_UNIQUE_POSTINGS,
          },
        ],

      },
      {
        name: 'Programmer',
        objectID: '12',
        job_postings: [
          {
            median_salary: TEST_MEDIAN_SALARY_2,
            unique_postings: TEST_UNIQUE_POSTINGS_2,
          },
        ],

      },
      ],
    };
    render(
      <SelectJobCardWithContext
        initialAppState={initialAppState}
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
        job_postings: [
          {
            median_salary: TEST_MEDIAN_SALARY,
          },
        ],
      },
      ],
    };
    render(
      <SelectJobCardWithContext
        initialAppState={initialAppState}
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
        job_postings: [
          {
            unique_postings: TEST_UNIQUE_POSTINGS,
          },
        ],
      },
      ],
    };
    render(
      <SelectJobCardWithContext
        initialAppState={initialAppState}
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
    render(
      <SelectJobCardWithContext
        initialAppState={initialAppState}
        initialJobCardState={initialJobCardState}
      />,
    );

    expect(screen.queryByRole('Card')).toBe(null);
  });
});
