import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { SUBSIDY_TYPE } from '../../enterprise-subsidy-requests/constants';
import { renderWithRouter } from '../../../utils/tests';
import CategoryCard from '../CategoryCard';
import { POLICY_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
  getMessages: () => ({}),
}));

// eslint-disable-next-line no-console
console.error = jest.fn();

const topCategory = {
  id: 1,
  name: 'Information Technology',
  skills: [
    { id: 78, name: 'Query Languages', score: null },
    { id: 79, name: 'MongoDB', score: null },
    { id: 81, name: 'Technology Roadmap', score: 1 },
    { id: 83, name: 'Sprint Planning', score: 2 },
    { id: 84, name: 'Blocker Resolution', score: 3 },
    { id: 85, name: 'Technical Communication', score: 1 },
  ],
  skillsSubcategories: [
    {
      id: 1,
      name: 'IT Management',
      skills: [
        { id: 81, name: 'Technology Roadmap', score: 1 },
        { id: 83, name: 'Sprint Planning', score: 2 },
        { id: 84, name: 'Blocker Resolution', score: 3 },
        { id: 85, name: 'Technical Communication', score: 1 },
      ],
    },
    {
      id: 2,
      name: 'Databases',
      skills: [
        { id: 78, name: 'Query Languages', score: null },
        { id: 79, name: 'MongoDB', score: null },
      ],
    },
  ],
  userScore: 0,
  edxAverageScore: null,
};

const defaultAppState = {
  enterpriseConfig: {
    slug: 'test-enterprise',
  },
  authenticatedUser: {
    username: 'edx',
    name: 'John Doe',
  },
};

const defaultSearchContext = {
  refinements: { skill_names: ['test-skill-1', 'test-skill-2'] },
  dispatch: () => null,
};

const defaultSubsidyRequestState = {
  subsidyRequestConfiguration: null,
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
  catalogsForSubsidyRequests: [],
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
  couponCodes: [],
  showExpirationNotifications: false,
  redeemableLearnerCreditPolicies: {
    redeemablePolicies: [{
      policyType: POLICY_TYPES.PER_LEARNER_CREDIT,
    }],
    learnerContentAssignments: {
      assignments: [],
      hasAssignments: false,
      activeAssignments: [],
      hasActiveAssignments: false,
    },
  },
};

const CategoryCardWithContext = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={defaultAppState}>
      <SearchContext.Provider value={defaultSearchContext}>
        <UserSubsidyContext.Provider value={expiringSubscriptionUserSubsidyState}>
          <SubsidyRequestsContext.Provider value={defaultSubsidyRequestState}>
            <CategoryCard topCategory={topCategory} />
          </SubsidyRequestsContext.Provider>
        </UserSubsidyContext.Provider>
      </SearchContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<CategoryCard />', () => {
  it('renders the CategoryCard component', () => {
    renderWithRouter(<CategoryCardWithContext />);
    const levelBarsContainer = screen.getAllByTestId('skill-category-chip');
    expect(levelBarsContainer.length === 2).toBeTruthy();
    const itManagementChip = screen.getByText('IT Management');

    const showAllButton = screen.getByText('Show (4) >');
    showAllButton.click(); // Show all of the skills in the IT Management category
    const showLessButton = screen.getByText('Show Less');
    showLessButton.click(); // Show less skills in the IT Management category

    itManagementChip.click(); // Hide the skills in the IT Management category

    itManagementChip.click(); // Show the skills in the IT Management category
    const databasesChip = screen.getByText('Databases');
    databasesChip.click(); // Show the skills in the Databases category
  });
});
