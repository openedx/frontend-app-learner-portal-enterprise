import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import SpiderChart from '../SpiderChart';
import { usePlotlySpiderChart } from '../data/hooks';

const baseCategories = {
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
  ],
};

jest.mock('plotly.js-dist', () => ({
  newPlot: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  usePlotlySpiderChart: jest.fn(),
}));

const SpiderChartWrapper = ({ categories }) => <SpiderChart categories={categories} />;

describe('usePlotlySpiderChart hook', () => {
  it('the hook is called', async () => {
    render(
      <SpiderChartWrapper categories={baseCategories} />,
    );
    await waitFor(() => expect(screen.getByTestId('skill-levels-spider')).toBeTruthy());
    expect(usePlotlySpiderChart).toHaveBeenCalledTimes(1);
  });
});
