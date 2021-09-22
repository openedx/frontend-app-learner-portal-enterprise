import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { useSelectedSkillsAndJobSkills } from '../hooks';
import { SkillsContext } from '../../SkillsContextProvider';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE, DROPDOWN_OPTION_GET_PROMOTED } from '../../constants';

const SearchWrapper = (searchContext, initialSkillsState) => ({ children }) => (
  <SearchContext.Provider value={searchContext}>
    <SkillsContext.Provider value={initialSkillsState}>
      {children}
    </SkillsContext.Provider>
  </SearchContext.Provider>
);

const skills = ['test-skill-1', 'test-skill-2'];
const SELECTED_JOB_SKILL_NAME = 'test-skill-3';
const CURRENT_JOB_SKILL_NAME = 'test-skill-4';
const searchContext = {
  refinements: { skill_names: skills },
};

const initialSkillsState = {
  state: {
    goal: DROPDOWN_OPTION_GET_PROMOTED,
    selectedJob: 'job-1',
    interestedJobs: [
      {
        name: 'job-1',
        skills: [
          {
            name: SELECTED_JOB_SKILL_NAME,
          },
        ],
      },
    ],
  },
};

describe('useSelectedSkillsAndJobSkills hook', () => {
  test('with getAllSkills true, returns learner selected skills and job-skills', () => {
    const { result } = renderHook(() => useSelectedSkillsAndJobSkills({
      getAllSkills: true,
    }), { wrapper: SearchWrapper(searchContext, initialSkillsState) });

    const skillsArray = result.current;
    const expected = skills.concat(SELECTED_JOB_SKILL_NAME);
    expect(skillsArray).toEqual(expected);
  });

  test('with getAllSkills false, returns job-skills only', () => {
    const { result } = renderHook(() => useSelectedSkillsAndJobSkills({
      getAllSkills: false,
    }), { wrapper: SearchWrapper(searchContext, initialSkillsState) });

    const skillsArray = result.current;
    const expected = [SELECTED_JOB_SKILL_NAME];
    expect(skillsArray).toEqual(expected);
  });

  test('when goal is "I want to improve at current role", returns currentJob skills', () => {
    const skillsContextWithCurrentRole = {
      state: {
        goal: DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE,
        selectedJob: 'job-1',
        currentJobRole: [
          {
            skills: [
              {
                name: CURRENT_JOB_SKILL_NAME,
              },
            ],
          },
        ],
      },
    };
    const { result } = renderHook(() => useSelectedSkillsAndJobSkills({
      getAllSkills: false,
    }), { wrapper: SearchWrapper(searchContext, skillsContextWithCurrentRole) });
    const skillsArray = result.current;
    const expected = [CURRENT_JOB_SKILL_NAME];
    expect(skillsArray).toEqual(expected);
  });
});
