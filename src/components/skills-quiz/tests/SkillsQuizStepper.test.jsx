import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { fireEvent, screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchContext, SearchData } from '@edx/frontend-enterprise-catalog-search';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

import { renderWithRouter } from '../../../utils/tests';
import SkillsQuizStepper from '../SkillsQuizStepper';
import { SkillsContext, SkillsContextProvider } from '../SkillsContextProvider';
import {
  CURRENT_JOB_FACET,
  DESIRED_JOB_FACET,
  DROPDOWN_OPTION_CHANGE_CAREERS,
  DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE,
  GOAL_DROPDOWN_DEFAULT_OPTION,
  INDUSTRY_FACET,
} from '../constants';

import edxLogo from '../images/edx-logo.svg';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';

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
  authenticatedUser: { username: 'myspace-tom' },
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

describe('<SkillsQuizStepper />', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('checks header is correctly rendered', () => {
    const searchContext = {
      refinements: {},
      dispatch: () => null,
    };

    const { getByAltText } = renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchContext.Provider value={{ ...searchContext }}>
                <SkillsContextProvider>
                  <SkillsQuizStepper />
                </SkillsContextProvider>
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>,
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText('Skills Builder')).toBeTruthy();
    expect(screen.getByText('Start your learning journey with edX')).toBeTruthy();
    const image = getByAltText('edx-logo');
    expect(image.src).toContain(edxLogo);
  });

  it('checks track event is sent on close', () => {
    const searchContext = {
      refinements: {},
      dispatch: () => null,
    };

    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchContext.Provider value={{ ...searchContext }}>
                <SkillsContextProvider>
                  <SkillsQuizStepper />
                </SkillsContextProvider>
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );
    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
    userEvent.click(closeButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(3);
  });

  it('checks continue button is in disabled state initially', () => {
    const searchContext = {
      refinements: {},
      dispatch: () => null,
    };

    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchContext.Provider value={{ ...searchContext }}>
                <SkillsContextProvider>
                  <SkillsQuizStepper />
                </SkillsContextProvider>
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText('Continue').disabled).toBeTruthy();
  });

  it('checks continue is enabled when some job is selected from search job ', () => {
    const searchContext = {
      refinements: { name: ['test-job1', 'test-job2'] },
      dispatch: () => null,
    };

    const skillsQuizContextInitialState = {
      state: { goal: DROPDOWN_OPTION_CHANGE_CAREERS },
    };

    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchContext.Provider value={{ ...searchContext }}>
                <SkillsContext.Provider value={skillsQuizContextInitialState}>
                  <SkillsQuizStepper />
                </SkillsContext.Provider>
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
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
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchContext.Provider value={{ ...searchContext }}>
                <SkillsContext.Provider value={skillsQuizContextInitialState}>
                  <SkillsQuizStepper />
                </SkillsContext.Provider>
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText(DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE)).toBeInTheDocument();
    expect(screen.getByText('Continue').disabled).toBeFalsy();
  });
  it('check continue is enable while some jobs are selectd and working correctly', () => {
    const searchContext = {
      refinements: { current_job: ['test-current-job'] },
      industry_names: ['Retail Trade'],
      dispatch: () => null,
    };

    const skillsQuizContextInitialState = {
      state: { goal: DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE },
      dispatch: () => null,
      props: { heading: 'Top Skills for the Job', skills: [], industrySkills: [] },
    };

    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchContext.Provider value={{ ...searchContext }}>
                <SkillsContext.Provider value={skillsQuizContextInitialState}>
                  <SkillsQuizStepper />
                </SkillsContext.Provider>
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );

    expect(screen.getByText(DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE)).toBeInTheDocument();
    expect(screen.getByText('Continue').disabled).toBeFalsy();
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);
    expect(screen.getByText('Continue').disabled).toBeFalsy();
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
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchContext.Provider value={{ ...searchContext }}>
                <SkillsContext.Provider value={skillsQuizContextInitialState}>
                  <SkillsQuizStepper />
                </SkillsContext.Provider>
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION)).toBeInTheDocument();
    expect(screen.queryByText(CURRENT_JOB_FACET.title)).toBeNull();
    expect(screen.queryByText(DESIRED_JOB_FACET.title)).toBeNull();
  });

  it('checks all dropdowns are shown when we have a goal selected', async () => {
    const searchContext = {
      refinements: {},
      dispatch: () => null,
    };
    const skillsQuizContextInitialState = {
      state: { goal: DROPDOWN_OPTION_CHANGE_CAREERS },
    };

    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchContext.Provider value={{ ...searchContext }}>
                <SkillsContext.Provider value={skillsQuizContextInitialState}>
                  <SkillsQuizStepper />
                </SkillsContext.Provider>
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText(INDUSTRY_FACET.title)).toBeInTheDocument();
    expect(screen.getByText(CURRENT_JOB_FACET.title)).toBeInTheDocument();
    expect(screen.getByText(DESIRED_JOB_FACET.title)).toBeInTheDocument();
  });

  it('checks i am currently a student checkbox works correctly', async () => {
    const skillsQuizContextInitialState = {
      state: { goal: DROPDOWN_OPTION_CHANGE_CAREERS },
    };
    renderWithRouter(
      <IntlProvider locale="en">
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
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );
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
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchData>
                <SkillsContext.Provider value={skillsQuizContextInitialState}>
                  <SkillsQuizStepper />
                </SkillsContext.Provider>
              </SearchData>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );
    const isStudentCheckbox = screen.getByTestId('is-student-checkbox');
    expect(isStudentCheckbox).not.toBeChecked();
    expect(isStudentCheckbox).toBeDisabled();
  });

  it('simulates clicking on the skills continue button', () => {
    const skillsQuizContextInitialState = {
      state: { goal: DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE },
      dispatch: () => null,
      props: { heading: 'Top Skills for the Job', skills: [], industrySkills: [] },
    };
    const searchContext = {
      refinements: { current_job: ['test-current-job'] },
      industry_names: ['Retail Trade'],
      dispatch: () => null,
    };

    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchContext.Provider value={{ ...searchContext }}>
                <SkillsContext.Provider value={skillsQuizContextInitialState}>
                  <SkillsQuizStepper />
                </SkillsContext.Provider>
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    const skillsContinueBtn = screen.getByTestId('skills-continue-button');
    userEvent.click(skillsContinueBtn);
    expect(screen.getByText('Done')).toBeTruthy();
    expect(screen.getByText('Go back')).toBeTruthy();
  });
});
