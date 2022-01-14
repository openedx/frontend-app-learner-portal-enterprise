import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContextProvider } from '../SkillsContextProvider';
import SelectedJobSkills from '../SelectedJobSkills';

/* eslint-disable react/prop-types */
const SelectedJobSkillsWithContext = ({
  initialSelectedJobSkillsState = {},
  initialAppState,
}) => (
  <AppContext.Provider value={initialAppState}>
    <SearchContext.Provider>
      <SkillsContextProvider initialState={initialSelectedJobSkillsState}>
        <SelectedJobSkills />
      </SkillsContextProvider>
    </SearchContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

const PROGRAMMING = 'Programming';
const ACCOUNTING = 'Accounting';
const FILING = 'Filing';
const JQUERY = 'JQuery';
const DOTNET = '.Net';
const PYTHON = 'Python';
const DJANGO = 'Django';
const SIGNIFICANCE_ONE = 111;
const SIGNIFICANCE_TWO = 99.3;
const SIGNIFICANCE_THREE = 77.44;
const SIGNIFICANCE_FOUR = 66.78;
const SIGNIFICANCE_FIVE = 61.322;
const SIGNIFICANCE_SIX = 60.22;
const SIGNIFICANCE_SEVEN = 12.44;

const initialAppState = {
  enterpriseConfig: {
    name: 'BearsRUs',
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
};

describe('<SelectedJobSkills />', () => {
  test('renders skills with top significance if more then 5', () => {
    const initialSelectedJobSkillsState = {
      selectedJob: 'TEST_JOB_TITLE',
      interestedJobs: [{
        name: 'TEST_JOB_TITLE',
        objectID: 'TEST_JOB_KEY',
        skills: [
          {
            name: PYTHON,
            significance: SIGNIFICANCE_ONE,
          },
          {
            name: DJANGO,
            significance: SIGNIFICANCE_SEVEN,
          },
          {
            name: ACCOUNTING,
            significance: SIGNIFICANCE_SIX,
          },
          {
            name: FILING,
            significance: SIGNIFICANCE_FOUR,
          },
          {
            name: DOTNET,
            significance: SIGNIFICANCE_FIVE,
          },
          {
            name: JQUERY,
            significance: SIGNIFICANCE_THREE,
          },
          {
            name: PROGRAMMING,
            significance: SIGNIFICANCE_TWO,
          },
        ],

      },
      ],
    };
    render(
      <SelectedJobSkillsWithContext
        initialAppState={initialAppState}
        initialSelectedJobSkillsState={initialSelectedJobSkillsState}
      />,
    );
    expect(screen.queryByText(PYTHON)).toBeInTheDocument();
    expect(screen.queryByText(FILING)).toBeInTheDocument();
    expect(screen.queryByText(PROGRAMMING)).toBeInTheDocument();
    expect(screen.queryByText(JQUERY)).toBeInTheDocument();
    expect(screen.queryByText(DOTNET)).toBeInTheDocument();
    expect(screen.queryByText(ACCOUNTING)).not.toBeInTheDocument();
  });

  test('renders skills as it is if less then 5', () => {
    const initialSelectedJobSkillsState = {
      selectedJob: 'TEST_JOB_TITLE',
      interestedJobs: [{
        name: 'TEST_JOB_TITLE',
        objectID: 'TEST_JOB_KEY',
        skills: [
          {
            name: PYTHON,
            significance: SIGNIFICANCE_ONE,
          },
          {
            name: DJANGO,
            significance: SIGNIFICANCE_SEVEN,
          },
          {
            name: ACCOUNTING,
            significance: SIGNIFICANCE_SIX,
          },
          {
            name: FILING,
            significance: SIGNIFICANCE_FOUR,
          },
          {
            name: DOTNET,
            significance: SIGNIFICANCE_FIVE,
          },
        ],

      },
      ],
    };
    render(
      <SelectedJobSkillsWithContext
        initialAppState={initialAppState}
        initialSelectedJobSkillsState={initialSelectedJobSkillsState}
      />,
    );
    expect(screen.queryByText(PYTHON)).toBeInTheDocument();
    expect(screen.queryByText(FILING)).toBeInTheDocument();
    expect(screen.queryByText(ACCOUNTING)).toBeInTheDocument();
    expect(screen.queryByText(DJANGO)).toBeInTheDocument();
    expect(screen.queryByText(DOTNET)).toBeInTheDocument();
  });

  test('Render only section title if skills not available', () => {
    const initialSelectedJobSkillsState = {
      selectedJob: 'TEST_JOB_TITLE',
      interestedJobs: [{
        name: 'TEST_JOB_TITLE',
        objectID: 'TEST_JOB_KEY',
        skills: [
        ],

      },
      ],
    };
    render(
      <SelectedJobSkillsWithContext
        initialAppState={initialAppState}
        initialSelectedJobSkillsState={initialSelectedJobSkillsState}
      />,
    );
    expect(screen.queryByTestId('top-skills-badge')).toBeNull();
  });
});
