import React from 'react';
import { screen, act, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { SkillsContextProvider } from '../SkillsContextProvider';

import SearchCurrentJobCard from '../SearchCurrentJobCard';
import { useEnterpriseCustomer } from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('react-loading-skeleton', () => ({
  __esModule: true,
  default: (props = {}) => <div data-testid={props['data-testid']} />,
}));

const initialAppState = {
  authenticatedUser: { username: 'test-username' },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
};

const SearchCurrentJobCardWithContext = ({
  index,
  initialSearchState,
  initialJobsState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SearchContext.Provider value={initialSearchState}>
        <SkillsContextProvider initialState={initialJobsState}>
          <SearchCurrentJobCard index={index} />
        </SkillsContextProvider>
      </SearchContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

const TEST_JOB_KEY = 'test-job-key';
const TEST_JOB_TITLE = 'Test Job Title';
const TEST_MEDIAN_SALARY = '100000';
const TEST_JOB_POSTINGS = '4321';
const TRANSFORMED_MEDIAN_SALARY = '$100,000';
const TRANSFORMED_JOB_POSTINGS = '4,321';

const hitObject = {
  hits: [
    {
      name: TEST_JOB_TITLE,
      objectID: TEST_JOB_KEY,
      job_postings: [
        {
          median_salary: TEST_MEDIAN_SALARY,
          unique_postings: TEST_JOB_POSTINGS,
        },
      ],
    },
  ],
};

const testIndex = {
  indexName: 'test-index-name',
  search: jest.fn().mockImplementation(() => Promise.resolve(hitObject)),
};

const initialSearchState = {
  refinements: { name: [] },
  dispatch: () => null,
};

const initialJobsState = {
  state: {
    interestedJobs: hitObject.hits,
  },
  dispatch: () => null,
};

const mockEnterpriseCustomer = {
  name: 'BearsRUs',
  hideLaborMarketData: false,
};

describe('<SearchCurrentJobCard />', () => {
  test('renders the data in job cards correctly', () => {.
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    renderWithRouter(
      <SearchCurrentJobCardWithContext
        index={testIndex}
        initialSearchState={initialSearchState}
        initialJobsState={initialJobsState}
      />,
    );
    expect(screen.getByText(TEST_JOB_TITLE)).toBeInTheDocument();
    expect(screen.getByText(TRANSFORMED_MEDIAN_SALARY)).toBeInTheDocument();
    expect(screen.getByText(TRANSFORMED_JOB_POSTINGS)).toBeInTheDocument();
  });

  test('does not render salary data when hideLaborMarketData is true ', () => {
    const hideLaborMarketConfig = {
      ...mockEnterpriseCustomer,
      hideLaborMarketData: true,
    };
    useEnterpriseCustomer.mockReturnValue({ data: hideLaborMarketConfig });
    renderWithRouter(
      <SearchCurrentJobCardWithContext
        index={testIndex}
        initialSearchState={initialSearchState}
        initialJobsState={initialJobsState}
      />,
    );
    expect(screen.queryByText(TRANSFORMED_MEDIAN_SALARY)).not.toBeInTheDocument();
    expect(screen.queryByText(TRANSFORMED_JOB_POSTINGS)).not.toBeInTheDocument();
  });
});
