import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { mergeConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SKILLS_QUIZ_SEARCH_PAGE_MESSAGE } from '../constants';

import {
  renderWithRouter,
} from '../../../utils/tests';
import { SkillsContextProvider } from '../SkillsContextProvider';
import SkillsQuizPage from '../SkillsQuizPage';
import { useEnterpriseCustomer } from '../../app/data';

const mockLocation = {
  pathname: '/welcome',
  hash: '',
  search: '',
  state: { activationSuccess: true },
};

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => (mockLocation),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

const defaultAppState = {
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: {
    username: 'myspace-tom',
  },
};

const SkillsQuizPageWithContext = ({
  initialAppState = defaultAppState,
  enableSkillsQuiz = true,
}) => {
  mergeConfig({
    ENABLE_SKILLS_QUIZ: enableSkillsQuiz,
  });
  return (
    <SearchData>
      <SkillsContextProvider>
        <IntlProvider locale="en">
          <AppContext.Provider value={initialAppState}>
            <SkillsQuizPage />
          </AppContext.Provider>
        </IntlProvider>
      </SkillsContextProvider>
    </SearchData>
  );
};

const mockEnterpriseCustomer = {
  slug: 'test-enterprise-slug',
  uuid: 'test-enterprise-uuid',
};

useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });

describe('SkillsQuizPage', () => {
  afterAll(() => {
    jest.restoreAllMocks();
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
