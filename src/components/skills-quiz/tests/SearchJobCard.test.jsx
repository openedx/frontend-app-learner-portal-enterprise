import React from 'react';
import { screen, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import SearchJobCard from '../SearchJobCard';

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

describe('<SearchJobCard />', () => {
  test('renders the data in job cards correctly', async () => {
    await act(async () => {
      renderWithSearchContext(<SearchJobCard index={testIndex} />);
    });
    expect(await screen.getByText(TEST_JOB_TITLE)).toBeInTheDocument();
    expect(await screen.getByText(TEST_MEDIAN_SALARY)).toBeInTheDocument();
    expect(await screen.getByText(TEST_JOB_POSTINGS)).toBeInTheDocument();
  });
});
