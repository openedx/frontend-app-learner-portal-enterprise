import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { SUBSIDY_TYPE } from '../../enterprise-subsidy-requests/constants';

import * as hooks from '../data/hooks';

import { renderWithRouter } from '../../../utils/tests';
import MyCareerTab from '../MyCareerTab';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
  getMessages: () => ({}),
}));

jest.mock('plotly.js-dist', () => {});

jest.mock('../data/hooks', () => ({
  usePlotlySpiderChart: jest.fn(),
  useLearnerSkillLevels: jest.fn(),
  useLearnerProfileData: jest.fn(),
}));

const testUserProfileData = {
  username: 'edx',
  id: 23,
  extended_profile: [
    {
      field_name: 'enterprise_learner_current_job',
      field_value: 27,
    },
  ],
};

const userDataNoCurrentJob = {
  username: 'edx',
  id: 23,
  extended_profile: [
    {
      field_name: 'enterprise_learner_current_job',
      field_value: null,
    },
  ],
};

hooks.useLearnerProfileData.mockReturnValue([
  camelCaseObject(testUserProfileData),
  null,
]);

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

const mockAuthenticatedUser = { username: 'edx', name: 'John Doe' };

const defaultAppState = {
  enterpriseConfig: {
    slug: 'test-enterprise',
  },
  authenticatedUser: mockAuthenticatedUser,
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
};

const MyCareerTabWithContext = ({
  initialAppState = defaultAppState,
  initialSubsidyRequestState = defaultSubsidyRequestState,
  initialUserSubsidyState = expiringSubscriptionUserSubsidyState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <SubsidyRequestsContext.Provider value={initialSubsidyRequestState}>
          <MyCareerTab jobId={27} />
        </SubsidyRequestsContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<MyCareerTab />', () => {
  global.URL.createObjectURL = jest.fn();

  it('renders the VisualizeCareer component when learner has a current job', () => {
    renderWithRouter(<MyCareerTabWithContext />);
    const readingInstructionsButton = screen.getByTestId(
      'reading-instructions-button',
    );
    readingInstructionsButton.click();
  });

  it('renders the AddJobRole when learner doesnt have any current job', () => {
    hooks.useLearnerProfileData.mockReturnValue([camelCaseObject(userDataNoCurrentJob), null, false]);
    renderWithRouter(<MyCareerTabWithContext />);
  });

  it('renders the LoadingSpinner component when data is not loaded yet', () => {
    hooks.useLearnerProfileData.mockReturnValue([null, null, true]);
    renderWithRouter(<MyCareerTabWithContext />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the ErrorPage component when there is problem loading data', () => {
    hooks.useLearnerProfileData.mockReturnValue([
      null,
      {
        status: 'Error loading data',
      },
      false,
    ]);
    renderWithRouter(<MyCareerTabWithContext />);
  });
});
