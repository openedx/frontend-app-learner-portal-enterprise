import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PathwaysSection from '../PathwaysSection';

describe('PathwaysSection', () => {
  it('renders pathway title and description correctly', () => {
    render(<PathwaysSection />);
    expect(screen.getByText('Ai for Leaders')).toBeInTheDocument();
  });

  it('renders launch button correctly', () => {
    render(<PathwaysSection />);
    expect(screen.getByRole('button', { name: 'Launch Pathway' })).toBeInTheDocument();
  });
});
