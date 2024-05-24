import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { hasFeatureFlagEnabled } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { SKILLS_QUIZ_SEARCH_PAGE_MESSAGE } from '../constants';
import { renderWithRouter } from '../../../utils/tests';
import SkillsQuiz from '../SkillsQuiz';
import { SkillsContextProvider } from '../SkillsContextProvider';
import { useEnterpriseCustomer } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
  hasFeatureFlagEnabled: jest.fn().mockReturnValue(false),
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

const SkillsQuizWithContext = ({
  initialAppState = defaultAppState,
}) => (
  <IntlProvider locale="en">
    <SearchData>
      <SkillsContextProvider>
        <AppContext.Provider value={initialAppState}>
          <SkillsQuiz />
        </AppContext.Provider>
      </SkillsContextProvider>
    </SearchData>
  </IntlProvider>
);

describe('<SkillsQuiz />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  it('renders skills quiz V1 page successfully.', () => {
    renderWithRouter(
      <SkillsQuizWithContext />,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText(SKILLS_QUIZ_SEARCH_PAGE_MESSAGE)).toBeTruthy();
  });

  it('renders skills quiz V2 page successfully for v2', () => {
    hasFeatureFlagEnabled.mockReturnValue(true);

    renderWithRouter(
      <SkillsQuizWithContext />,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText('What roles are you interested in ?')).toBeInTheDocument();
  });
});
