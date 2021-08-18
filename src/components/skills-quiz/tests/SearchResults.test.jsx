import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import SearchResults from '../SearchResults';
import { JOBS_ERROR_ALERT_MESSAGE } from '../constants';

jest.mock('react-loading-skeleton', () => ({
  __esModule: true,
  // eslint-disable-next-line react/prop-types
  default: (props = {}) => <div data-testid={props['data-testid']} />,
}));

const context = { refinements: { skill_names: ['Skill_1'] } };

/* eslint-enable react/prop-types */
const SearchResultsWithContext = (props) => (
  <SearchContext.Provider value={context}>
    <SearchResults {...props} />
  </SearchContext.Provider>
);
/* eslint-enable react/prop-types */

const TEST_SEARCH_RESULTS = {
  nbHits: 2,
  hits: [
    {
      key: 'TEST_JOB_KEY_1',
      title: 'TEST_JOB_TITLE_1',
      medianSalary: 'TEST_MEDIAN_SALARY',
      jobPostings: 'TEST_JOB_POSTINGS',
    },
    {
      key: 'TEST_JOB_KEY_2',
      title: 'TEST_JOB_TITLE_2',
      medianSalary: 'TEST_MEDIAN_SALARY',
      jobPostings: 'TEST_JOB_POSTINGS',
    },
  ],
};

const propsForLoading = {
  searchResults: TEST_SEARCH_RESULTS,
  isSearchStalled: true,
  error: undefined,
  isJobResult: true,
};

const propsForError = {
  searchResults: undefined,
  isSearchStalled: false,
  error: {
    body: 'Test Error String',
  },
  isJobResult: true,
};

describe('<SearchResults />', () => {
  test('renders loading component correctly when search is stalled', () => {
    render(
      <SearchResultsWithContext {...propsForLoading} />,
    );
    expect(screen.queryByTestId('job-title-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('job-content-loading')).toBeInTheDocument();
  });

  test('renders an alert in case of an error', () => {
    render(
      <SearchResultsWithContext {...propsForError} />,
    );
    expect(screen.getByText(JOBS_ERROR_ALERT_MESSAGE)).toBeTruthy();
  });
  // TODO: Add main test case once jobs data is available in Algolia.undefined.undefined
});
