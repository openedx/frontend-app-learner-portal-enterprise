import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouter } from '../../../utils/tests';
import CategoryCard from '../CategoryCard';

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
        { id: 81, name: 'Technology Roadmap', score: 1 },
        { id: 83, name: 'Sprint Planning', score: 2 },
        { id: 84, name: 'Blocker Resolution', score: 3 },
        { id: 85, name: 'Technical Communication', score: 1 },
      ],
    },
  ],
  userScore: 0,
  edxAverageScore: null,
};

const CategoryCardWithTopCategory = () => (
  <CategoryCard topCategory={topCategory} />
);

describe('<CategoryCard />', () => {
  it('renders the CategoryCard component', () => {
    renderWithRouter(<CategoryCardWithTopCategory />);
    const levelBarsContainer = screen.getAllByTestId('skill-category-chip');
    expect(levelBarsContainer.length === 2).toBeTruthy();
    const itManagementChip = screen.getByText('IT Management');
    itManagementChip.click(); // Show the skills in the IT Management category

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
