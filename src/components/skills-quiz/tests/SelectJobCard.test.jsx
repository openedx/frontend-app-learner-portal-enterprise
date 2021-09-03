import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContextProvider } from '../SkillsContextProvider';
import SelectJobCard from '../SelectJobCard';

const initialAppState = {
  enterpriseConfig: {
    name: 'BearsRUs',
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
};

/* eslint-disable react/prop-types */
const SelectJobCardWithContext = ({
  initialJobCardState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <SearchContext.Provider>
      <SkillsContextProvider initialState={initialJobCardState}>
        <SelectJobCard />
      </SkillsContextProvider>
    </SearchContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<SelectJobCard />', () => {
  test('renders job card', () => {
    const initialJobCardState = {
      interestedJobs: [{
        name: 'TEST_JOB_TITLE',
        objectID: 'TEST_JOB_KEY',
        job_postings: [
          {
            median_salary: '$10000',
            unique_postings: '45',
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
    expect(screen.queryByText(initialJobCardState.interestedJobs[0].job_postings[0].median_salary)).toBeInTheDocument();
    expect(screen.queryByText(initialJobCardState.interestedJobs[0].job_postings[0].unique_postings))
      .toBeInTheDocument();
  });

  test('renders multiple job card', () => {
    const initialJobCardState = {
      interestedJobs: [{
        name: 'Engineer',
        objectID: '11',
        job_postings: [
          {
            median_salary: '$10000',
            unique_postings: '45',
          },
        ],

      },
      {
        name: 'Programmer',
        objectID: '12',
        job_postings: [
          {
            median_salary: '$20000',
            unique_postings: '35',
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
    expect(screen.queryByText(initialJobCardState.interestedJobs[0].job_postings[0].median_salary)).toBeInTheDocument();
    expect(screen.queryByText(initialJobCardState.interestedJobs[0].job_postings[0].unique_postings))
      .toBeInTheDocument();
    expect(screen.queryByText(initialJobCardState.interestedJobs[1].name)).toBeInTheDocument();
    expect(screen.queryByText(initialJobCardState.interestedJobs[1].job_postings[0].median_salary)).toBeInTheDocument();
    expect(screen.queryByText(initialJobCardState.interestedJobs[1].job_postings[0].unique_postings))
      .toBeInTheDocument();
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
