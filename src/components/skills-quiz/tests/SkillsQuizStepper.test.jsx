import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, act } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import {
  SearchContext, removeFromRefinementArray, deleteRefinementAction, SearchData,
} from '@edx/frontend-enterprise-catalog-search';

import {
  renderWithRouter,
} from '../../../utils/tests';
import SkillsQuizStepper from '../SkillsQuizStepper';
import { SkillsContextProvider, SkillsContext } from '../SkillsContextProvider';
import {
  DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE,
  GOAL_DROPDOWN_DEFAULT_OPTION,
  SKILLS_FACET,
  CURRENT_JOB_FACET,
  DESIRED_JOB_FACET,
  DROPDOWN_OPTION_GET_PROMOTED,
} from '../constants';

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ username: 'myspace-tom' }),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
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
      slug: 'BearsRYou',
    },
    config: {
      LMS_BASE_URL: process.env.LMS_BASE_URL,
    },
  };

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('Handles removal skill is handled correctly.', async () => {
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
    expect(screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION)).toBeInTheDocument();
    await act(async () => {
      await screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION).click();
      await screen.queryByText(DROPDOWN_OPTION_GET_PROMOTED).click();
    });
    expect(screen.queryByText(SKILLS_FACET.title)).toBeInTheDocument();

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

  it('checks no other dropdown is rendered until correct goal is selected', () => {
    const searchContext = {
      refinements: {},
      dispatch: () => null,
    };
    const skillsQuizContextInitialState = {
      state: { goal: GOAL_DROPDOWN_DEFAULT_OPTION },
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
    expect(screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION)).toBeInTheDocument();
    expect(screen.queryByText(SKILLS_FACET.title)).toBeNull();
    expect(screen.queryByText(CURRENT_JOB_FACET.title)).toBeNull();
    expect(screen.queryByText(DESIRED_JOB_FACET.title)).toBeNull();
  });

  it('checks skills is rendered when goal is changed and job dropdowns are hidden still', async () => {
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
    expect(screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION)).toBeInTheDocument();
    await act(async () => {
      await screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION).click();
      screen.queryByText(DROPDOWN_OPTION_GET_PROMOTED).click();
    });

    expect(screen.queryByText(SKILLS_FACET.title)).toBeInTheDocument();
    expect(screen.queryByText(CURRENT_JOB_FACET.title)).toBeNull();
    expect(screen.queryByText(DESIRED_JOB_FACET.title)).toBeNull();
  });

  it('checks all dropdowns are shown when we have goal and skills', async () => {
    renderWithRouter(
      <AppContext.Provider value={initialAppState}>
        <SearchData>
          <SkillsContextProvider>
            <SkillsQuizStepper />
          </SkillsContextProvider>
        </SearchData>
      </AppContext.Provider>,
      { route: '/test/skills-quiz/?skill_names=123' },
    );
    expect(screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION)).toBeInTheDocument();
    await act(async () => {
      await screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION).click();
      screen.queryByText(DROPDOWN_OPTION_GET_PROMOTED).click();
    });

    expect(screen.queryByText(SKILLS_FACET.title)).toBeInTheDocument();
    expect(screen.queryByText(CURRENT_JOB_FACET.title)).toBeInTheDocument();
    expect(screen.queryByText(DESIRED_JOB_FACET.title)).toBeInTheDocument();
  });

  it('Handles removal of the last skill is handled correctly.', async () => {
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

    expect(screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION)).toBeInTheDocument();
    await act(async () => {
      await screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION).click();
      await screen.queryByText(DROPDOWN_OPTION_GET_PROMOTED).click();
    });
    expect(screen.queryByText(SKILLS_FACET.title)).toBeInTheDocument();
    // expect(screen.queryByText('test-skill-1')).toBeInTheDocument();
    // remove the last skill as well and make sure deleteRefinementAction is called.
    screen.getByTestId('test-skill-1').click();
    expect(deleteRefinementAction.mock.calls.length).toBe(1);
  });
});
