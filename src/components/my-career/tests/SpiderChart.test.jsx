import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouter } from '../../../utils/tests';
import SpiderChart from '../SpiderChart';

jest.mock('plotly.js-dist', () => {});

jest.mock('../data/hooks', () => ({
  usePlotlySpiderChart: jest.fn(),
}));

// eslint-disable-next-line no-console
console.error = jest.fn();

describe('<SpiderChart />', () => {
  global.URL.createObjectURL = jest.fn();

  it('renders the SpiderChart component', () => {
    renderWithRouter(<SpiderChart />);
    expect(screen.getByTestId('skill-levels-spider')).toBeInTheDocument();
  });
});
