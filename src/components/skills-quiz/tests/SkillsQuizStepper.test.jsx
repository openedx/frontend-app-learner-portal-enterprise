import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchContext, removeFromRefinementArray, deleteRefinementAction } from '@edx/frontend-enterprise-catalog-search';

import {
  renderWithRouter,
} from '../../../utils/tests';
import SkillsQuizStepper from '../SkillsQuizStepper';
import { SkillsContextProvider, SkillsContext } from '../SkillsContextProvider';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE } from '../constants';

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ username: 'myspace-tom' }),
}));

// Add mocks.
jest.mock('@edx/frontend-enterprise-catalog-search', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-catalog-search'),
  useNbHitsFromSearchResults: () => 0,
  deleteRefinementAction: jest.fn(),
  removeFromRefinementArray: jest.fn(),
}));

describe('<SkillsQuizStepper />', () => {
  const initialAppState = {
    enterpriseConfig: {
      name: 'BearsRUs',
    },
    config: {
      LMS_BASE_URL: process.env.LMS_BASE_URL,
    },
  };

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('Handles removal skill is handled correctly.', () => {
    const searchContext = {
      refinements: { skill_names: ['test-skill-1', 'test-skill-2'] },
      dispatch: () => null,
    };

    renderWithRouter(
      <AppContext.Provider value={initialAppState}>
        <SearchContext.Provider value={{ ...searchContext }}>
          <SkillsContextProvider>
            <SkillsQuizStepper />
          </SkillsContextProvider>
        </SearchContext.Provider>
      </AppContext.Provider>,
      { route: '/test/skills-quiz/' },
    );

    // Remove the first selected skill.
    screen.getByTestId('test-skill-1').click();
    expect(removeFromRefinementArray.mock.calls.length).toBe(1);
  });

  it('checks continue button is in disabled state initially', () => {
    const searchContext = {
      refinements: {},
      dispatch: () => null,
    };

    renderWithRouter(
      <AppContext.Provider value={initialAppState}>
        <SearchContext.Provider value={{ ...searchContext }}>
          <SkillsContextProvider>
            <SkillsQuizStepper />
          </SkillsContextProvider>
        </SearchContext.Provider>
      </AppContext.Provider>,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText('Continue').disabled).toBeTruthy();
  });

  it('checks continue is enabled when some job is selected from search job ', () => {
    const searchContext = {
      refinements: { name: ['test-job1', 'test-job2'] },
      dispatch: () => null,
    };

    renderWithRouter(
      <AppContext.Provider value={initialAppState}>
        <SearchContext.Provider value={{ ...searchContext }}>
          <SkillsContextProvider>
            <SkillsQuizStepper />
          </SkillsContextProvider>
        </SearchContext.Provider>
      </AppContext.Provider>,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText('Continue').disabled).toBeFalsy();
  });

  it('checks continue is enabled when improvement option and current job is selected', () => {
    const searchContext = {
      refinements: { current_job: ['test-current-job'] },
      dispatch: () => null,
    };
    const skillsQuizContextInitialState = {
      state: { goal: DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE },
    };

    renderWithRouter(
      <AppContext.Provider value={initialAppState}>
        <SearchContext.Provider value={{ ...searchContext }}>
          <SkillsContext.Provider value={skillsQuizContextInitialState}>
            <SkillsQuizStepper />
          </SkillsContext.Provider>
        </SearchContext.Provider>
      </AppContext.Provider>,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText(DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE)).toBeInTheDocument();
    expect(screen.getByText('Continue').disabled).toBeFalsy();
  });

  it('checks continue is disabled when improvement option is selected and current job not selected', () => {
    const searchContext = {
      refinements: {},
      dispatch: () => null,
    };
    const skillsQuizContextInitialState = {
      state: { goal: DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE },
    };

    renderWithRouter(
      <AppContext.Provider value={initialAppState}>
        <SearchContext.Provider value={{ ...searchContext }}>
          <SkillsContext.Provider value={skillsQuizContextInitialState}>
            <SkillsQuizStepper />
          </SkillsContext.Provider>
        </SearchContext.Provider>
      </AppContext.Provider>,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText(DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE)).toBeInTheDocument();
    expect(screen.getByText('Continue').disabled).toBeTruthy();
  });

  it('Handles removal of the last skill is handled correctly.', () => {
    const searchContext = {
      refinements: { skill_names: ['test-skill-1'] },
      dispatch: () => null,
    };

    renderWithRouter(
      <AppContext.Provider value={initialAppState}>
        <SearchContext.Provider value={{ ...searchContext }}>
          <SkillsContextProvider>
            <SkillsQuizStepper />
          </SkillsContextProvider>
        </SearchContext.Provider>
      </AppContext.Provider>,
      { route: '/test/skills-quiz/' },
    );

    // remove the last skill as well and make sure deleteRefinementAction is called.
    screen.getByTestId('test-skill-1').click();
    expect(deleteRefinementAction.mock.calls.length).toBe(1);
  });
});
