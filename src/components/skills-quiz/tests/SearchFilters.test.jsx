import React from 'react';
import { act, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContextProvider } from '../SkillsContextProvider';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import {
  DESIRED_JOB_FACET,
  INDUSTRY_FACET,
  CURRENT_JOB_FACET,
  GOAL_DROPDOWN_DEFAULT_OPTION,
  DROPDOWN_OPTION_GET_PROMOTED,
} from '../constants';

import '../__mocks__/react-instantsearch-dom';
import SkillsQuizStepper from '../SkillsQuizStepper';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ username: 'myspace-tom' }),
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

const facetsToTest = [DESIRED_JOB_FACET, INDUSTRY_FACET, CURRENT_JOB_FACET];
describe('<SkillsQuizStepper />', () => {
  const defaultAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
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

  test('renders skills and jobs dropdown with a label', async () => {
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
      { route: '/test/skills-quiz/' },
    );
    expect(screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION)).toBeInTheDocument();
    await act(async () => {
      await screen.queryByText(GOAL_DROPDOWN_DEFAULT_OPTION).click();
      screen.queryByText(DROPDOWN_OPTION_GET_PROMOTED).click();
    });
    facetsToTest.forEach((filter) => {
      expect(screen.getByText(filter.title)).toBeInTheDocument();
    });
  });
});
