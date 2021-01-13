import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';

import { renderWithRouter } from '../../../../utils/tests';
import SidebarCard from '../SidebarCard';

describe('<SidebarCard />', () => {
  const childrenText = 'Some text goes here';
  const defaultProps = {
    children: <>{childrenText}</>,
    buttonLink: 'http://bears.party',
  };
  it('renders the card children', () => {
    renderWithRouter(<SidebarCard {...defaultProps} />);
    expect(screen.getByText(childrenText)).toBeTruthy();
  });
  it('renders a card title', () => {
    const title = 'Here be dragons';
    renderWithRouter(<SidebarCard {...defaultProps} title={title} />);
    expect(screen.getByText(title)).toBeTruthy();
  });
});
