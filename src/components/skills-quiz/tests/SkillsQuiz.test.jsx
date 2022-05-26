import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SKILLS_QUIZ_SEARCH_PAGE_MESSAGE } from '../constants';

import {
  renderWithRouter,
} from '../../../utils/tests';
import SkillsQuiz from '../SkillsQuiz';
import { SkillsContextProvider } from '../SkillsContextProvider';

/* eslint-disable react/prop-types */
const SkillsQuizWithContext = ({
  initialAppState = {},
  initialUserSubsidyState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <SkillsQuiz />
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

const mockLocation = {
  pathname: '/welcome',
  hash: '',
  search: '',
  state: { activationSuccess: true },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => (mockLocation),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ username: 'myspace-tom' }),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

describe('<SkillsQuiz />', () => {
  const defaultCouponCodesState = {
    couponCodes: [],
    loading: false,
    couponCodesCount: 0,
  };
  const initialAppState = {
    enterpriseConfig: {
      name: 'BearsRUs',
    },
    config: {
      LMS_BASE_URL: process.env.LMS_BASE_URL,
    },
  };
  const initialUserSubsidyState = {
    couponCodes: defaultCouponCodesState,
  };

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders skills quiz page successfully.', () => {
    renderWithRouter(
      <SearchData>
        <SkillsContextProvider>
          <SkillsQuizWithContext initialAppState={initialAppState} initialUserSubsidyState={initialUserSubsidyState} />
        </SkillsContextProvider>
      </SearchData>,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText(SKILLS_QUIZ_SEARCH_PAGE_MESSAGE)).toBeTruthy();
  });
});
