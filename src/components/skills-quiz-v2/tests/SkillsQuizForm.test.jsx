import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { renderWithRouter } from '../../../utils/tests';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SkillsContext } from '../../skills-quiz/SkillsContextProvider';
import { GOAL_DROPDOWN_DEFAULT_OPTION } from '../../skills-quiz/constants';
import SkillQuizForm from '../SkillsQuizForm';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';

const defaultAppState = {
  enterpriseConfig: {
    name: 'test-enterprise',
    slug: 'test-enterprise-slug',
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: { username: 'test-user' },
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

const skillsQuizContextInitialState = {
  state: { goal: GOAL_DROPDOWN_DEFAULT_OPTION },
};

const searchContext = {
  refinements: {},
  dispatch: () => null,
};

describe('<SkillQuizForm />', () => {
  it('renders skills quiz v2 page', () => {
    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchContext.Provider value={{ ...searchContext }}>
                <SkillsContext.Provider value={skillsQuizContextInitialState}>
                  <SkillQuizForm />
                </SkillsContext.Provider>
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText('What roles are you interested in ?')).toBeTruthy();
  });

  it('toggles advanced options visibility on button click', () => {
    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchContext.Provider value={{ ...searchContext }}>
                <SkillsContext.Provider value={skillsQuizContextInitialState}>
                  <SkillQuizForm />
                </SkillsContext.Provider>
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );

    expect(screen.getByText('Show advanced options')).toBeTruthy();
  });

  it('renders current job title selection when advanced options are visible', () => {
    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchContext.Provider value={{ ...searchContext }}>
                <SkillsContext.Provider value={skillsQuizContextInitialState}>
                  <SkillQuizForm />
                </SkillsContext.Provider>
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );
    const button = screen.getByText('Show advanced options');
    userEvent.click(button);
    expect(screen.getByText('Search and select your current job title')).toBeTruthy();
  });

  it('renders industry selection when advanced options are visible', () => {
    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <UserSubsidyContext.Provider value={defaultUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
              <SearchContext.Provider value={{ ...searchContext }}>
                <SkillsContext.Provider value={skillsQuizContextInitialState}>
                  <SkillQuizForm />
                </SkillsContext.Provider>
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );
    const button = screen.getByText('Show advanced options');
    userEvent.click(button);
    expect(screen.getByText('What industry are you interested in ?')).toBeTruthy();
  });
});
