import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { hasFeatureFlagEnabled } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SKILLS_QUIZ_SEARCH_PAGE_MESSAGE } from '../constants';

import {
  defaultSubsidyHooksData, mockSubsidyHooksReturnValues,
  renderWithRouter,
} from '../../../utils/tests';
import SkillsQuiz from '../SkillsQuiz';
import { SkillsContextProvider } from '../SkillsContextProvider';
import {
  useEnterpriseCustomer,
} from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useSubscriptions: jest.fn(),
  useRedeemablePolicies: jest.fn(),
  useCouponCodes: jest.fn(),
  useEnterpriseOffers: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useCatalogsForSubsidyRequests: jest.fn(),
}));

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

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
  hasFeatureFlagEnabled: jest.fn().mockReturnValue(false),
}));

const defaultAppState = {
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: {
    username: 'myspace-tom',
  },
};

const SkillsQuizWithContext = ({
  initialAppState = defaultAppState,
}) => (
  <SearchData>
    <SkillsContextProvider>
      <IntlProvider locale="en">
        <AppContext.Provider value={initialAppState}>
          <SkillsQuiz />
        </AppContext.Provider>
      </IntlProvider>
    </SkillsContextProvider>
  </SearchData>
);

mockSubsidyHooksReturnValues(defaultSubsidyHooksData);

const mockEnterpriseCustomer = {
  name: 'BearsRUs',
  slug: 'BearsRYou',
};

useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });

describe('<SkillsQuiz />', () => {
  afterAll(() => {
    jest.restoreAllMocks();
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
