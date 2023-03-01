import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import SelectedJobSkills from '../SelectedJobSkills';

const SelectedJobSkillsWithContext = ({
  searchContext = {},
  initialAppState,
  props,
}) => (
  <AppContext.Provider value={initialAppState}>
    <SearchContext.Provider value={searchContext}>
      <SelectedJobSkills {...props} />
    </SearchContext.Provider>
  </AppContext.Provider>
);

const PROGRAMMING = 'Programming';
const ACCOUNTING = 'Accounting';
const JQUERY = 'JQuery';
const PYTHON = 'Python';
const DJANGO = 'Django';

const skillsArray = [
  { id: 1, name: PROGRAMMING },
  { id: 2, name: ACCOUNTING },
  { id: 3, name: JQUERY },
  { id: 4, name: PYTHON },
  { id: 5, name: DJANGO },
];

const initialAppState = {
  enterpriseConfig: {
    name: 'BearsRUs',
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
};

const searchContext = {
  refinements: {
    industry_names: ['Retail Trade'],
  },
};

describe('<SelectedJobSkills />', () => {
  test('renders skills and heading correctly', () => {
    const HEADING = 'Top Skills for the Job';
    const props = { heading: HEADING, skills: skillsArray, industrySkills: [] };
    render(
      <SelectedJobSkillsWithContext
        initialAppState={initialAppState}
        searchContext={searchContext}
        props={props}
      />,
    );
    expect(screen.queryByText(HEADING)).toBeInTheDocument();
    expect(screen.queryByText(PROGRAMMING)).toBeInTheDocument();
    expect(screen.queryByText(ACCOUNTING)).toBeInTheDocument();
    expect(screen.queryByText(JQUERY)).toBeInTheDocument();
    expect(screen.queryByText(PYTHON)).toBeInTheDocument();
    expect(screen.queryByText(DJANGO)).toBeInTheDocument();
  });

  test('renders skills badge with dark variant if skill matches industry skill', () => {
    const HEADING = 'Top Skills for the Job';
    const props = { heading: HEADING, skills: [{ id: 1, name: PROGRAMMING }], industrySkills: [PROGRAMMING] };
    render(
      <SelectedJobSkillsWithContext
        initialAppState={initialAppState}
        searchContext={searchContext}
        props={props}
      />,
    );
    expect(screen.queryByText(HEADING)).toBeInTheDocument();
    expect(screen.queryByText(PROGRAMMING)).toBeInTheDocument();
    expect(screen.getByTestId('top-skills-badge')).toHaveStyle('background: dark');
  });
});
