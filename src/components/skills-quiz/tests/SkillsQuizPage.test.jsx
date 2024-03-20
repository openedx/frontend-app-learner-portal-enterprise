import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { camelCaseObject, mergeConfig } from '@edx/frontend-platform';
import { Factory } from 'rosie';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SKILLS_QUIZ_SEARCH_PAGE_MESSAGE } from '../constants';

import { renderWithRouter } from '../../../utils/tests';
import { SkillsContextProvider } from '../SkillsContextProvider';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import SkillsQuizPage from '../SkillsQuizPage';
import { useEnterpriseCustomer } from '../../app/data';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const defaultCouponCodesState = {
  couponCodes: [],
  loading: false,
  couponCodesCount: 0,
};

const mockEnterpriseCustomer = camelCaseObject(Factory.build('enterpriseCustomer'));
const mockAuthenticatedUser = camelCaseObject(Factory.build('authenticatedUser'));

const defaultAppState = {
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: mockAuthenticatedUser,
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
    <IntlProvider locale="en">
      <AppContext.Provider value={initialAppState}>
        <UserSubsidyContext.Provider value={initialUserSubsidyState}>
          <SubsidyRequestsContext.Provider value={initialSubsidyRequestState}>
            <SkillsQuizPage />
          </SubsidyRequestsContext.Provider>
        </UserSubsidyContext.Provider>
      </AppContext.Provider>
    </IntlProvider>
  );
};

describe('SkillsQuizPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
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
