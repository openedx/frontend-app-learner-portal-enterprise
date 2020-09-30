import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';

import { renderWithRouter, FakeAppContext } from '../../../utils/tests';
import SideboardCard from './SidebarCard';

describe('<SidebarCard />', () => {
  const childrenText = 'Some text goes here';
  const defaultProps = {
    children: <>{childrenText}</>,
    linkIsLocal: false,
    buttonLink: 'http://bears.party',
  };
  it('renders the card children', () => {
    renderWithRouter(<SideboardCard {...defaultProps} />);
    expect(screen.getByText(childrenText)).toBeTruthy();
  });
  it('renders a card title', () => {
    const title = 'Here be dragons';
    renderWithRouter(<SideboardCard {...defaultProps} title={title} />);
    expect(screen.getByText(title)).toBeTruthy();
  });
  it('renders a button with button text', () => {
    const buttonText = 'Click Me';
    renderWithRouter(
      <FakeAppContext initialAppState={{ enterpriseConfig: { slug: 'sluggykins' } }}>
        <SideboardCard {...defaultProps} buttonText={buttonText} />
      </FakeAppContext>,
    );
    expect(screen.queryByText(buttonText)).toBeTruthy();
  });
});
