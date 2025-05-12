import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import algoliasearch from 'algoliasearch/lite';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouter } from '../../../utils/tests';
import CategoryCard from '../CategoryCard';
import {
  useDefaultSearchFilters,
  useEnterpriseCustomer,
  useIsAssignmentsOnlyLearner,
} from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('algoliasearch/lite');
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
  getMessages: () => ({}),
}));
jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useIsAssignmentsOnlyLearner: jest.fn(),
  useAlgoliaSearch: jest.fn(),
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
    useDefaultSearchFilters.mockReturnValue(`enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}`);
    algoliasearch.mockReturnValue({
      initIndex: jest.fn().mockReturnValue({
        search: jest.fn().mockResolvedValue({ hits: [] }),
      }),
    });
  });
  it('renders the CategoryCard component', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CategoryCardWithContext />);
    const levelBarsContainer = screen.getAllByTestId('skill-category-chip');
    expect(levelBarsContainer.length === 2).toBeTruthy();
    const itManagementChip = screen.getByText('IT Management');

    const showAllButton = screen.getByText('Show (4) >');
    await user.click(showAllButton); // Show all of the skills in the IT Management category
    const showLessButton = screen.getByText('Show Less');
    await user.click(showLessButton); // Show less skills in the IT Management category

    await user.click(itManagementChip); // Hide the skills in the IT Management category

    await user.click(itManagementChip); // Show the skills in the IT Management category
    const databasesChip = screen.getByText('Databases');
    await user.click(databasesChip); // Show the skills in the Databases category
  });
});
