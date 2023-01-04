import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouter } from '../../../utils/tests';
import LevelBars from '../LevelBars';

// eslint-disable-next-line no-console
console.error = jest.fn();

describe('<LevelBars />', () => {
  it('renders the LevelBars component and count number of bars with less than zero levels', () => {
    renderWithRouter(<LevelBars skillLevel={-3} />);

    const levelBarsContainer = screen.getByTestId('level-bars');
    expect(levelBarsContainer).toBeInTheDocument();

    const levelBars = screen.getAllByTestId('level-bar');
    expect(levelBars.length === 3).toBeTruthy();
  });

  it('renders the LevelBars component and count number of bars', () => {
    renderWithRouter(<LevelBars />);

    const levelBarsContainer = screen.getByTestId('level-bars');
    expect(levelBarsContainer).toBeInTheDocument();

    const levelBars = screen.getAllByTestId('level-bar');
    expect(levelBars.length === 3).toBeTruthy();
  });

  it('renders the LevelBars component and count number of bars with more than zero levels', () => {
    renderWithRouter(<LevelBars skillLevel={4} />);

    const levelBarsContainer = screen.getByTestId('level-bars');
    expect(levelBarsContainer).toBeInTheDocument();

    const levelBars = screen.getAllByTestId('level-bar');
    expect(levelBars.length === 3).toBeTruthy();
  });
});
