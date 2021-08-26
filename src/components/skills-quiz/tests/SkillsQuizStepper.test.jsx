import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchContext, removeFromRefinementArray, deleteRefinementAction } from '@edx/frontend-enterprise-catalog-search';

import {
  renderWithRouter,
} from '../../../utils/tests';
import SkillsQuizStepper from '../SkillsQuizStepper';
import { SkillsContextProvider } from '../SkillsContextProvider';

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
