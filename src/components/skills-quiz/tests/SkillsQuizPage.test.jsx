import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { mergeConfig } from '@edx/frontend-platform';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SKILLS_QUIZ_SEARCH_PAGE_MESSAGE } from '../constants';

import {
  renderWithRouter,
} from '../../../utils/tests';
import { SkillsContextProvider } from '../SkillsContextProvider';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import SkillsQuizPage from '../SkillsQuizPage';

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

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: jest.fn().mockReturnValue(null),
}));

const defaultCouponCodesState = {
  couponCodes: [],
  loading: false,
  couponCodesCount: 0,
};

const defaultAppState = {
  enterpriseConfig: {
    name: 'BearsRUs',
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
};

const defaultUserSubsidyState = {
  couponCodes: defaultCouponCodesState,
};

const defaultSubsidyRequestState = {
  catalogsForSubsidyRequests: [],
};
const SkillsQuizPageWithContext = ({
  initialAppState = defaultAppState,
  initialUserSubsidyState = defaultUserSubsidyState,
  initialSubsidyRequestState = defaultSubsidyRequestState,
  enableSkillsQuiz = true,
}) => {
  mergeConfig({
    ENABLE_SKILLS_QUIZ: enableSkillsQuiz,
  });
  return (
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <SubsidyRequestsContext.Provider value={initialSubsidyRequestState}>
          <SkillsQuizPage />
        </SubsidyRequestsContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  );
};

describe('SkillsQuizPage', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });
  it('should render SkillsQuiz', async () => {
    renderWithRouter(
      <SearchData>
        <SkillsContextProvider>
          <SkillsQuizPageWithContext enableSkillsQuiz />
        </SkillsContextProvider>
      </SearchData>,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText(SKILLS_QUIZ_SEARCH_PAGE_MESSAGE)).toBeInTheDocument();
  });
  it('should render null', async () => {
    renderWithRouter(
      <SearchData>
        <SkillsContextProvider>
          <SkillsQuizPageWithContext enableSkillsQuiz={false} />
        </SkillsContextProvider>
      </SearchData>,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.queryByText(SKILLS_QUIZ_SEARCH_PAGE_MESSAGE)).not.toBeInTheDocument();
  });
});
