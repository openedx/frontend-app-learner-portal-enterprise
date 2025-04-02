import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { renderWithRouter } from '../../../utils/tests';
import CategoryCard from '../CategoryCard';
import { useDefaultSearchFilters, useEnterpriseCustomer, useIsAssignmentsOnlyLearner } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
  getMessages: () => ({}),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useIsAssignmentsOnlyLearner: jest.fn(),
  useDefaultSearchFilters: jest.fn(),
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

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const CategoryCardWithContext = () => (
  <IntlProvider locale="en">
    <CategoryCard topCategory={topCategory} />
  </IntlProvider>
);

describe('<CategoryCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useIsAssignmentsOnlyLearner.mockReturnValue(false);
    useDefaultSearchFilters.mockReturnValue({ filters: `enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}` });
  });
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
