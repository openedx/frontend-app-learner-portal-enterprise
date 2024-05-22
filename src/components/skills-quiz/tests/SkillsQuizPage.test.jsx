import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { mergeConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SKILLS_QUIZ_SEARCH_PAGE_MESSAGE } from '../constants';

import { renderWithRouter } from '../../../utils/tests';
import { SkillsContextProvider } from '../SkillsContextProvider';
import SkillsQuizPage from '../SkillsQuizPage';
import { useEnterpriseCustomer } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

const defaultAppState = {
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: mockAuthenticatedUser,
};

const SkillsQuizPageWithContext = ({
  initialAppState = defaultAppState,
  enableSkillsQuiz = true,
}) => {
  mergeConfig({
    ENABLE_SKILLS_QUIZ: enableSkillsQuiz,
  });
  return (
    <IntlProvider locale="en">
      <SearchData>
        <SkillsContextProvider>
          <AppContext.Provider value={initialAppState}>
            <SkillsQuizPage />
          </AppContext.Provider>
        </SkillsContextProvider>
      </SearchData>
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
      <SkillsQuizPageWithContext enableSkillsQuiz />,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText(SKILLS_QUIZ_SEARCH_PAGE_MESSAGE)).toBeInTheDocument();
  });
  it('should render null', async () => {
    renderWithRouter(
      <SkillsQuizPageWithContext enableSkillsQuiz={false} />,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.queryByText(SKILLS_QUIZ_SEARCH_PAGE_MESSAGE)).not.toBeInTheDocument();
  });
});
