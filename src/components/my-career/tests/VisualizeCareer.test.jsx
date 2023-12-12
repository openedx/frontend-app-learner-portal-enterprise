import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import * as hooks from '../data/hooks';

import { renderWithRouter } from '../../../utils/tests';
import VisualizeCareer from '../VisualizeCareer';
import { SUBSIDY_TYPE, SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { POLICY_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
  getMessages: () => ({}),
}));

jest.mock('plotly.js-dist', () => { });

jest.mock('../data/hooks', () => ({
  usePlotlySpiderChart: jest.fn(),
  useLearnerSkillLevels: jest.fn(),
}));

hooks.usePlotlySpiderChart.mockReturnValue({});

hooks.usePlotlySpiderChart.mockReturnValue({
  data: [
    {
      type: 'scatterpolar',
      r: [0, 0, 0, 0, 0, 0],
      theta: [
        'Query Languages',
        'MongoDB',
        'Technology Roadmap',
        'Sprint Planning',
        'Blocker Resolution',
        'Technical Communication',
      ],
      fill: 'toself',
      name: 'You',
    },
    {
      type: 'scatterpolar',
      r: [0, 0, 0, 0, 0, 0],
      theta: [
        'Query Languages',
        'MongoDB',
        'Technology Roadmap',
        'Sprint Planning',
        'Blocker Resolution',
        'Technical Communication',
      ],
      fill: 'toself',
      name: 'Career Path',
    },
  ],
  layout: {
    polar: {
      radialaxis: {
        visible: true,
        range: [0, 5],
      },
    },
    showlegend: true,
  },
  config: {
    displayModeBar: false,
  },
});

hooks.useLearnerSkillLevels.mockReturnValue([
  {
    id: 27,
    name: 'Applications developer',
    skillCategories: [
      {
        id: 1,
        name: 'Information Technology',
        skills: [
          { id: 78, name: 'Query Languages', score: null },
          { id: 79, name: 'MongoDB', score: null },
          { id: 81, name: 'Technology Roadmap', score: null },
          { id: 83, name: 'Sprint Planning', score: null },
          { id: 84, name: 'Blocker Resolution', score: null },
          { id: 85, name: 'Technical Communication', score: null },
        ],
        skillsSubcategories: [
          {
            id: 1,
            name: 'Databases',
            skills: [
              { id: 78, name: 'Query Languages', score: null },
              { id: 79, name: 'MongoDB', score: null },
            ],
          },
          {
            id: 2,
            name: 'IT Management',
            skills: [
              { id: 81, name: 'Technology Roadmap', score: null },
              { id: 83, name: 'Sprint Planning', score: null },
              { id: 84, name: 'Blocker Resolution', score: null },
              { id: 85, name: 'Technical Communication', score: null },
            ],
          },
        ],
        userScore: 0,
        edxAverageScore: null,
      },
      {
        id: 2,
        name: 'Business',
        skills: [
          { id: 80, name: 'Need Assesment', score: null },
          { id: 82, name: 'Comprehension', score: null },
        ],
        skillsSubcategories: [
          {
            id: 6,
            name: 'Sales',
            skills: [{ id: 80, name: 'Need Assesment', score: null }],
          },
          {
            id: 7,
            name: 'Communication',
            skills: [{ id: 82, name: 'Comprehension', score: null }],
          },
        ],
        userScore: 0,
        edxAverageScore: null,
      },
    ],
  },
  null,
]);

// eslint-disable-next-line no-console
console.error = jest.fn();

const defaultAppState = {
  enterpriseConfig: {
    slug: 'test-enterprise',
  },
  authenticatedUser: {
    username: 'enterprise-learner-1',
  },
};

const defaultSubsidyRequestState = {
  subsidyRequestConfiguration: null,
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
  catalogsForSubsidyRequests: [],
};

const defaultCouponCodesState = {
  couponCodes: [],
  loading: false,
  couponCodesCount: 0,
};

const expiringSubscriptionUserSubsidyState = {
  subsidyRequestConfiguration: null,
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
  catalogsForSubsidyRequests: [],
  subscriptionPlan: {
    daysUntilExpiration: 60,
  },
  showExpirationNotifications: false,
  couponCodes: defaultCouponCodesState,
  redeemableLearnerCreditPolicies: [{
    policyType: POLICY_TYPES.PER_LEARNER_CREDIT,
  }],
};

const defaultSearchContext = {
  refinements: { skill_names: ['test-skill-1', 'test-skill-2'] },
  dispatch: () => null,
};

const VisualizeCareerWithContext = ({
  initialAppState = defaultAppState,
  initialSubsidyRequestState = defaultSubsidyRequestState,
  initialUserSubsidyState = expiringSubscriptionUserSubsidyState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SearchContext.Provider value={defaultSearchContext}>
        <UserSubsidyContext.Provider value={initialUserSubsidyState}>
          <SubsidyRequestsContext.Provider value={initialSubsidyRequestState}>
            <VisualizeCareer jobId={27} />
          </SubsidyRequestsContext.Provider>
        </UserSubsidyContext.Provider>
      </SearchContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<VisualizeCareer />', () => {
  global.URL.createObjectURL = jest.fn();

  it('renders the VisualizeCareer component', () => {
    renderWithRouter(<VisualizeCareerWithContext />);
    const readingInstructionsButton = screen.getByTestId('reading-instructions-button');
    readingInstructionsButton.click();
  });

  it('renders the LoadingSpinner component when data is not loaded yet', () => {
    hooks.useLearnerSkillLevels.mockReturnValue([null, null]);
    renderWithRouter(<VisualizeCareerWithContext />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the ErrorPage component when there is problem loading data', () => {
    hooks.useLearnerSkillLevels.mockReturnValue([null, {
      status: 'Error loading data',
    }]);
    renderWithRouter(<VisualizeCareerWithContext />);
  });
});
