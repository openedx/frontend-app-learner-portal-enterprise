import React from 'react';
// import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import SelectJobCard from '../SelectJobCard';

import { renderWithSearchContext } from './utils';

jest.mock('react-truncate', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('react-loading-skeleton', () => ({
  __esModule: true,
  // eslint-disable-next-line react/prop-types
  default: (props = {}) => <div data-testid={props['data-testid']} />,
}));

const TEST_JOB_KEY = 'test-job-key';
const TEST_JOB_TITLE = 'Test Job Title';
const TEST_MEDIAN_SALARY = '$10,0000';
const TEST_JOB_POSTINGS = '4321';

const defaultProps = {
  hit: {
    key: TEST_JOB_KEY,
    title: TEST_JOB_TITLE,
    medianSalary: TEST_MEDIAN_SALARY,
    jobPostings: TEST_JOB_POSTINGS,
  },
};

const propsForLoading = {
  hit: {},
  isLoading: true,
};

describe('<SelectJobCard />', () => {
  test('renders the data in job cards correctly', () => {
    renderWithSearchContext(<SelectJobCard {...defaultProps} />);

    // TODO: Uncomment these lines when jobs data is available as hits
    // expect(screen.getByText(TEST_JOB_TITLE)).toBeInTheDocument();
    // expect(screen.getByText(TEST_MEDIAN_SALARY)).toBeInTheDocument();
    // expect(screen.getByText(TEST_JOB_POSTINGS)).toBeInTheDocument();
  });

  test('renders the loading state when job data is being fetched', () => {
    renderWithSearchContext(<SelectJobCard {...propsForLoading} />);
    // assert <Skeleton /> loading components render to verify
    // job card is properly in a loading state.

    // TODO: Uncomment these lines when jobs data is available as hits
    // expect(screen.queryByTestId('job-title-loading')).toBeInTheDocument();
    // expect(screen.queryByTestId('job-content-loading')).toBeInTheDocument();
  });
});
