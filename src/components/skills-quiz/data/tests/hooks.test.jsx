import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { useSelectedSkillsAndJobSkills } from '../hooks';
import { SkillsContext } from '../../SkillsContextProvider';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE, DROPDOWN_OPTION_GET_PROMOTED } from '../../constants';

const SearchWrapper = (searchContext, initialSkillsState) => function BaseSearchWrapper({ children }) {
  return (
    <SearchContext.Provider value={searchContext}>
      <SkillsContext.Provider value={initialSkillsState}>
        {children}
      </SkillsContext.Provider>
    </SearchContext.Provider>
  );
};

const skills = ['test-skill-1', 'test-skill-2'];
const SELECTED_JOB_SKILL_NAME = 'test-skill-3';
const CURRENT_JOB_SKILL_NAME = 'test-skill-4';
const SELECTED_JOB_SKILL_NAME_ONE = 'selected-skill-1';
const SELECTED_JOB_SKILL_NAME_TWO = 'selected-skill-2';
const SELECTED_JOB_SKILL_NAME_THREE = 'selected-skill-3';
const SELECTED_JOB_SKILL_NAME_FOUR = 'selected-skill-4';
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
    const args = {
      getAllSkills: true,
    };
    const { result } = renderHook(
      () => useSelectedSkillsAndJobSkills(args),
      { wrapper: SearchWrapper(searchContext, initialSkillsState) },
    );

    const skillsArray = result.current;
    const expected = skills.concat(SELECTED_JOB_SKILL_NAME);
    expect(skillsArray).toEqual(expected);
  });

  test('with getAllSkills false, returns job-skills only', () => {
    const args = {
      getAllSkills: false,
    };
    const { result } = renderHook(
      () => useSelectedSkillsAndJobSkills(args),
      { wrapper: SearchWrapper(searchContext, initialSkillsState) },
    );

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
    const args = {
      getAllSkills: false,
    };
    const { result } = renderHook(
      () => useSelectedSkillsAndJobSkills(args),
      { wrapper: SearchWrapper(searchContext, skillsContextWithCurrentRole) },
    );
    const skillsArray = result.current;
    const expected = [CURRENT_JOB_SKILL_NAME];
    expect(skillsArray).toEqual(expected);
  });

  test('with getAllSkillsWithSignificanceOrder true, returns learner selected skills and'
    + ' job-skills with significance order', () => {
    const skillsContextWithSignificanceOrder = {
      state: {
        goal: DROPDOWN_OPTION_GET_PROMOTED,
        selectedJob: 'job-1',
        interestedJobs: [
          {
            name: 'job-1',
            skills: [
              {
                name: SELECTED_JOB_SKILL_NAME_ONE,
                significance: 230,
              },
              {
                name: SELECTED_JOB_SKILL_NAME_TWO,
                significance: 400,
              },
              {
                name: SELECTED_JOB_SKILL_NAME_THREE,
                significance: 120,
              },
              {
                name: SELECTED_JOB_SKILL_NAME_FOUR,
                significance: 401,
              },
            ],
          },
        ],
      },
    };
    const args = {
      getAllSkills: false,
      getAllSkillsWithSignificanceOrder: true,
    };
    const { result } = renderHook(
      () => useSelectedSkillsAndJobSkills(args),
      { wrapper: SearchWrapper(searchContext, skillsContextWithSignificanceOrder) },
    );

    const skillsArray = result.current;
    const expected = [
      { key: SELECTED_JOB_SKILL_NAME_FOUR, value: 401 },
      { key: SELECTED_JOB_SKILL_NAME_TWO, value: 400 },
      { key: SELECTED_JOB_SKILL_NAME_ONE, value: 230 },
      { key: SELECTED_JOB_SKILL_NAME_THREE, value: 120 },
      { key: 'test-skill-1', value: undefined },
      { key: 'test-skill-2', value: undefined },
    ];
    expect(skillsArray).toEqual(expected);
  });

  test('with getAllSkillsWithSignificanceOrder true, returns learner selected skills and'
    + ' job-skills for current job with significance order', () => {
    const skillsContextWithSignificanceOrder = {
      state: {
        goal: DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE,
        selectedJob: 'job-1',
        currentJobRole: [
          {
            name: 'job-1',
            skills: [
              {
                name: SELECTED_JOB_SKILL_NAME_ONE,
                significance: 230,
              },
              {
                name: SELECTED_JOB_SKILL_NAME_TWO,
                significance: 400,
              },
              {
                name: SELECTED_JOB_SKILL_NAME_THREE,
                significance: 820,
              },
              {
                name: SELECTED_JOB_SKILL_NAME_FOUR,
                significance: 401,
              },
            ],
          },
        ],
      },
    };
    const args = {
      getAllSkills: false,
      getAllSkillsWithSignificanceOrder: true,
    };
    const { result } = renderHook(
      () => useSelectedSkillsAndJobSkills(args),
      { wrapper: SearchWrapper(searchContext, skillsContextWithSignificanceOrder) },
    );

    const skillsArray = result.current;
    const expected = [
      { key: SELECTED_JOB_SKILL_NAME_THREE, value: 820 },
      { key: SELECTED_JOB_SKILL_NAME_FOUR, value: 401 },
      { key: SELECTED_JOB_SKILL_NAME_TWO, value: 400 },
      { key: SELECTED_JOB_SKILL_NAME_ONE, value: 230 },
      { key: 'test-skill-1', value: undefined },
      { key: 'test-skill-2', value: undefined },
    ];
    expect(skillsArray).toEqual(expected);
  });
});
