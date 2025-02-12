// [tech debt] Several warnings/errors output related to
// "Cannot log after tests are done. Did you forget to wait
// for something async in your test" and Algolia.

import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { fireEvent, screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchContext, SearchData } from '@edx/frontend-enterprise-catalog-search';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { renderWithRouter } from '../../../utils/tests';
import edxLogo from '../images/edx-logo.svg';
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
import { useEnterpriseCustomer, useDefaultSearchFilters } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

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

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useDefaultSearchFilters: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

const defaultAppState = {
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: mockAuthenticatedUser,
};

const defaultSearchContext = {
  refinements: {},
  dispatch: () => null,
};

const SkillsQuizStepperWithContext = ({
  skillsQuizContext = null,
}) => {
  if (!skillsQuizContext) {
    return (
      <SkillsContextProvider>
        <SkillsQuizStepper />
      </SkillsContextProvider>
    );
  }
  return (
    <SkillsContext.Provider value={skillsQuizContext}>
      <SkillsQuizStepper />
    </SkillsContext.Provider>
  );
};

const SkillsQuizStepperWrapper = ({
  appState = defaultAppState,
  searchContext = defaultSearchContext,
  skillsQuizContext = null,
  includeSearchDataWrapper = false,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={appState}>
      <SearchContext.Provider value={searchContext}>
        {includeSearchDataWrapper
          ? (
            <SearchData>
              <SkillsQuizStepperWithContext skillsQuizContext={skillsQuizContext} />
            </SearchData>
          )
          : (
            <SkillsQuizStepperWithContext skillsQuizContext={skillsQuizContext} />
          )}
      </SearchContext.Provider>
    </AppContext.Provider>,
  </IntlProvider>
);

describe('<SkillsQuizStepper />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useDefaultSearchFilters.mockReturnValue({ filters: `enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}` });
  });

  it('checks header is correctly rendered', () => {
    const { getByAltText } = renderWithRouter(
      <SkillsQuizStepperWrapper />,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText('Skills Builder')).toBeTruthy();
    expect(screen.getByText('Start your learning journey with edX')).toBeTruthy();
    const image = getByAltText('edx-logo');
    expect(image.src).toContain(edxLogo);
  });

  it('checks track event is sent on close', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <SkillsQuizStepperWrapper />,
      { route: '/test/skills-quiz/' },
    );
    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    await user.click(closeButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });

  it('checks continue button is in disabled state initially', () => {
    renderWithRouter(
      <SkillsQuizStepperWrapper />,
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
      <SkillsQuizStepperWrapper searchContext={searchContext} skillsQuizContext={skillsQuizContextInitialState} />,
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
      <SkillsQuizStepperWrapper searchContext={searchContext} skillsQuizContext={skillsQuizContextInitialState} />,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText(DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE)).toBeInTheDocument();
    expect(screen.getByText('Continue').disabled).toBeFalsy();
  });

  it('check continue is enable while some jobs are selected and working correctly', () => {
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
      <SkillsQuizStepperWrapper searchContext={searchContext} skillsQuizContext={skillsQuizContextInitialState} />,
      { route: '/test/skills-quiz/' },
    );

    expect(screen.getAllByText(DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE)).toBeTruthy();
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
      <SkillsQuizStepperWrapper searchContext={searchContext} skillsQuizContext={skillsQuizContextInitialState} />,
      { route: '/test/skills-quiz/' },
    );

    expect(screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION)).toBeInTheDocument();
    expect(screen.queryByText(CURRENT_JOB_FACET.title)).toBeNull();
    expect(screen.queryByText(DESIRED_JOB_FACET.title)).toBeNull();
  });

  it('checks all dropdowns are shown when we have a goal selected', () => {
    const searchContext = {
      refinements: {},
      dispatch: () => null,
    };
    const skillsQuizContextInitialState = {
      state: { goal: DROPDOWN_OPTION_CHANGE_CAREERS },
    };

    renderWithRouter(
      <SkillsQuizStepperWrapper searchContext={searchContext} skillsQuizContext={skillsQuizContextInitialState} />,
      { route: '/test/skills-quiz/' },
    );

    expect(screen.getByText(INDUSTRY_FACET.title)).toBeInTheDocument();
    expect(screen.getByText(CURRENT_JOB_FACET.title)).toBeInTheDocument();
    expect(screen.getByText(DESIRED_JOB_FACET.title)).toBeInTheDocument();
  });

  it('checks i am currently a student checkbox works correctly', async () => {
    const user = userEvent.setup();
    const skillsQuizContextInitialState = {
      state: { goal: DROPDOWN_OPTION_CHANGE_CAREERS },
    };
    renderWithRouter(
      <SkillsQuizStepperWrapper includeSearchDataWrapper skillsQuizContext={skillsQuizContextInitialState} />,
      { route: '/test/skills-quiz/' },
    );

    const isStudentCheckbox = screen.getByTestId('is-student-checkbox');
    expect(isStudentCheckbox).not.toBeChecked();
    await user.click(isStudentCheckbox);
    expect(isStudentCheckbox).toBeChecked();
  });

  it(`checks i am currently a student is disabled and unchecked on ${DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE}`, () => {
    const skillsQuizContextInitialState = {
      state: { goal: DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE },
    };
    renderWithRouter(
      <SkillsQuizStepperWrapper includeSearchDataWrapper skillsQuizContext={skillsQuizContextInitialState} />,
      { route: '/test/skills-quiz/' },
    );

    const isStudentCheckbox = screen.getByTestId('is-student-checkbox');
    expect(isStudentCheckbox).not.toBeChecked();
    expect(isStudentCheckbox).toBeDisabled();
  });

  it('simulates clicking on the skills continue button', async () => {
    const user = userEvent.setup();
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
      <SkillsQuizStepperWrapper searchContext={searchContext} skillsQuizContext={skillsQuizContextInitialState} />,
      { route: '/test/skills-quiz/' },
    );

    const continueButton = screen.getByText('Continue');
    await user.click(continueButton);

    const skillsContinueBtn = screen.getByTestId('skills-continue-button');
    await user.click(skillsContinueBtn);
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Go back')).toBeInTheDocument();
  });
});
