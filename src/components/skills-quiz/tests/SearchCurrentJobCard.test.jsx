import React from 'react';
import { screen, act, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SkillsContextProvider } from '../SkillsContextProvider';

import SearchCurrentJobCard from '../SearchCurrentJobCard';

jest.mock('react-loading-skeleton', () => ({
  __esModule: true,
  default: (props = {}) => <div data-testid={props['data-testid']} />,
}));

const SearchCurrentJobCardWithContext = ({
  index,
  initialAppState,
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

const initialAppState = {
  enterpriseConfig: {
    name: 'BearsRUs',
    hideLaborMarketData: false,
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
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

describe('<SearchCurrentJobCard />', () => {
  test('renders the data in job cards correctly', async () => {
    await act(async () => {
      render(
        <SearchCurrentJobCardWithContext
          index={testIndex}
          initialAppState={initialAppState}
          initialSearchState={initialSearchState}
          initialJobsState={initialJobsState}
        />,
      );
    });
    expect(await screen.getByText(TEST_JOB_TITLE)).toBeInTheDocument();
    expect(await screen.getByText(TRANSFORMED_MEDIAN_SALARY)).toBeInTheDocument();
    expect(await screen.getByText(TRANSFORMED_JOB_POSTINGS)).toBeInTheDocument();
  });

  test('does not render salary data when hideLaborMarketData is true ', async () => {
    const appState = {
      enterpriseConfig: {
        hideLaborMarketData: true,
      },
    };
    await act(async () => {
      render(
        <SearchCurrentJobCardWithContext
          index={testIndex}
          initialAppState={appState}
          initialSearchState={initialSearchState}
          initialJobsState={initialJobsState}
        />,
      );
    });
    expect(await screen.queryByText(TRANSFORMED_MEDIAN_SALARY)).not.toBeInTheDocument();
    expect(await screen.queryByText(TRANSFORMED_JOB_POSTINGS)).not.toBeInTheDocument();
  });
});
