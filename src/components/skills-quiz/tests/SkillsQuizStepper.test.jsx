import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { screen, act } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import {
  SearchContext, removeFromRefinementArray, deleteRefinementAction, SearchData,
} from '@edx/frontend-enterprise-catalog-search';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

import {
  renderWithRouter,
} from '../../../utils/tests';
import SkillsQuizStepper from '../SkillsQuizStepper';
import { SkillsContextProvider, SkillsContext } from '../SkillsContextProvider';
import {
  DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE,
  GOAL_DROPDOWN_DEFAULT_OPTION,
  DROPDOWN_OPTION_CHANGE_CAREERS,
  SKILLS_FACET,
  CURRENT_JOB_FACET,
  DESIRED_JOB_FACET,
  DROPDOWN_OPTION_GET_PROMOTED,
} from '../constants';

import edxLogo from '../images/edx-logo.svg';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';

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

const defaultAppState = {
  enterpriseConfig: {
    name: 'BearsRUs',
    slug: 'BearsRYou',
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
};

const defaultCouponCodesState = {
  couponCodes: [],
  loading: false,
  couponCodesCount: 0,
};

const defaultUserSubsidyState = {
  couponCodes: defaultCouponCodesState,
};

const defaultSubsidyRequestState = {
  catalogsForSubsidyRequests: [],
};

const SkillsQuizStepperWrapper = ({ searchContext, skillsQuizContextState }) => {
  const contextValue = useMemo(() => ({ ...searchContext }), [searchContext]);
  const skillContextProvider = skillsQuizContextState ? (
    <SkillsContext.Provider value={skillsQuizContextState}>
      <SkillsQuizStepper />
    </SkillsContext.Provider>
  ) : (
    <SkillsContextProvider>
      <SkillsQuizStepper />
    </SkillsContextProvider>
  );

  const searchContextProvider = searchContext ? (
    <SearchContext.Provider value={contextValue}>
      {skillContextProvider}
    </SearchContext.Provider>
  ) : (
    <SearchData>
      {skillContextProvider}
    </SearchData>
  );
  return (
    <AppContext.Provider value={defaultAppState}>
      <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
        <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
          <SearchContext.Provider value={contextValue}>
            {searchContextProvider}
          </SearchContext.Provider>
        </SubsidyRequestsContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  );
};
SkillsQuizStepperWrapper.defaultProps = {
  searchContext: null,
  skillsQuizContextState: null,
};

SkillsQuizStepperWrapper.propTypes = {
  searchContext: PropTypes.shape({}),
  skillsQuizContextState: PropTypes.shape({}),
};

describe('<SkillsQuizStepper />', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('Handles removal skill is handled correctly.', async () => {
    const searchContext = {
      refinements: { skill_names: ['test-skill-1', 'test-skill-2'] },
      dispatch: () => null,
    };

    renderWithRouter(
      <SkillsQuizStepperWrapper searchContext={searchContext} />,
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

  it('checks header is correctly rendered', () => {
    const searchContext = {
      refinements: {},
      dispatch: () => null,
    };

    const { getByAltText } = renderWithRouter(
      <SkillsQuizStepperWrapper searchContext={searchContext} />,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText('Skills Builder')).toBeTruthy();
    expect(screen.getByText('Start your learning journey with edX')).toBeTruthy();
    const image = getByAltText('edx-logo');
    expect(image.src).toContain(edxLogo);
  });

  it('checks continue button is in disabled state initially', () => {
    const searchContext = {
      refinements: {},
      dispatch: () => null,
    };

    renderWithRouter(
      <SkillsQuizStepperWrapper searchContext={searchContext} />,
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
      <SkillsQuizStepperWrapper searchContext={searchContext} />,
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
      <SkillsQuizStepperWrapper searchContext={searchContext} skillsQuizContextState={skillsQuizContextInitialState} />,
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
      <SkillsQuizStepperWrapper searchContext={searchContext} skillsQuizContextState={skillsQuizContextInitialState} />,
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
      <SkillsQuizStepperWrapper searchContext={searchContext} skillsQuizContextState={skillsQuizContextInitialState} />,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION)).toBeInTheDocument();
    expect(screen.queryByText(SKILLS_FACET.title)).toBeNull();
    expect(screen.queryByText(CURRENT_JOB_FACET.title)).toBeNull();
    expect(screen.queryByText(DESIRED_JOB_FACET.title)).toBeNull();
  });

  it('checks skills is rendered when goal is changed and job dropdowns are hidden still', async () => {
    const searchContext = {
      refinements: {},
      dispatch: () => null,
    };

    renderWithRouter(
      <SkillsQuizStepperWrapper searchContext={searchContext} />,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION)).toBeInTheDocument();
    userEvent.click(await screen.findByText(GOAL_DROPDOWN_DEFAULT_OPTION));
    userEvent.click(await screen.findByText(DROPDOWN_OPTION_GET_PROMOTED));

    expect(screen.queryByText(SKILLS_FACET.title)).toBeInTheDocument();
    expect(screen.queryByText(CURRENT_JOB_FACET.title)).toBeNull();
    expect(screen.queryByText(DESIRED_JOB_FACET.title)).toBeNull();
  });

  it('checks all dropdowns are shown when we have goal and skills', async () => {
    renderWithRouter(
      <AppContext.Provider value={defaultAppState}>
        <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
          <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
            <SearchData>
              <SkillsContextProvider>
                <SkillsQuizStepper />
              </SkillsContextProvider>
            </SearchData>
          </SubsidyRequestsContext.Provider>
        </UserSubsidyContext.Provider>
      </AppContext.Provider>,
      { route: '/test/skills-quiz/?skill_names=xyz' },
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
      <SkillsQuizStepperWrapper searchContext={searchContext} />,
      { route: '/test/skills-quiz/' },
    );

    expect(screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION)).toBeInTheDocument();
    await act(async () => {
      await screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION).click();
      await screen.queryByText(DROPDOWN_OPTION_GET_PROMOTED).click();
    });
    expect(screen.queryByText(SKILLS_FACET.title)).toBeInTheDocument();
    // remove the last skill as well and make sure deleteRefinementAction is called.
    screen.getByTestId('test-skill-1').click();
    expect(deleteRefinementAction.mock.calls.length).toBe(1);
  });

  it('checks i am currently a student checkbox works correctly', async () => {
    const skillsQuizContextInitialState = {
      state: { goal: DROPDOWN_OPTION_CHANGE_CAREERS },
    };
    renderWithRouter(
      <AppContext.Provider value={defaultAppState}>
        <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
          <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
            <SearchData>
              <SkillsContextProvider initialState={skillsQuizContextInitialState}>
                <SkillsQuizStepper />
              </SkillsContextProvider>
            </SearchData>
          </SubsidyRequestsContext.Provider>
        </UserSubsidyContext.Provider>
      </AppContext.Provider>,
      { route: '/test/skills-quiz/?skill_names=xyz' },
    );
    expect(await screen.findByText(SKILLS_FACET.title)).toBeInTheDocument();
    const isStudentCheckbox = screen.getByTestId('is-student-checkbox');
    expect(isStudentCheckbox).not.toBeChecked();
    userEvent.click(isStudentCheckbox);
    expect(isStudentCheckbox).toBeChecked();
  });

  it(`checks i am currently a student is disabled and unchecked on ${DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE}`, () => {
    const skillsQuizContextInitialState = {
      state: { goal: DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE },
    };

    renderWithRouter(
      <SkillsQuizStepperWrapper skillsQuizContextState={skillsQuizContextInitialState} />,
      { route: '/test/skills-quiz/?skill_names=xyz' },
    );
    const isStudentCheckbox = screen.getByTestId('is-student-checkbox');
    expect(isStudentCheckbox).not.toBeChecked();
    expect(isStudentCheckbox).toBeDisabled();
  });
});
