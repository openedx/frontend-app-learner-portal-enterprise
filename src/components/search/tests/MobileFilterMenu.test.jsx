import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { MobileFilterMenuBase } from '../MobileFilterMenu';

import { SUBJECTS, AVAILABLILITY, FACET_ATTRIBUTES } from '../data/tests/constants';
import { renderWithRouter } from '../../../utils/tests';
import SearchData from '../SearchContext';

// eslint-disable-next-line react/prop-types
const MobileFilterMenuWrapper = ({ items }) => (
  <SearchData>
    <MobileFilterMenuBase items={items}>
      <span data-testid="did-i-render" />
    </MobileFilterMenuBase>
  </SearchData>
);

describe('<MobileFilterMenu />', () => {
  test('renders the modal initially closed, but opens on Filters button click', () => {
    renderWithRouter(
      <MobileFilterMenuWrapper items={[]} />,
    );

    // assert modal is initially hidden
    expect(screen.getByRole('dialog')).toHaveClass('d-none');
    expect(screen.getByRole('dialog')).not.toHaveClass('d-block show');

    fireEvent.click(screen.getByText('Filters'));

    // assert modal is now visible after clicking the Filters button
    expect(screen.getByRole('dialog')).not.toHaveClass('d-none');
    expect(screen.getByRole('dialog')).toHaveClass('d-block show');
  });

  test('renders with active refinements', () => {
    const items = [{
      attribute: FACET_ATTRIBUTES.SUBJECTS,
      items: [{ label: SUBJECTS.COMPUTER_SCIENCE }, { label: SUBJECTS.COMMUNICATION }],
    }, {
      attribute: FACET_ATTRIBUTES.AVAILABLILITY,
      items: [{ label: AVAILABLILITY.AVAILABLE_NOW }],
    }];

    renderWithRouter(
      <MobileFilterMenuWrapper items={items} />,
    );

    // assert that "3 selected" appears in both places (i.e., the button that opens
    // the modal and the modal header and the modal header)
    expect(screen.queryAllByText('3 selected', { exact: false })).toHaveLength(2);

    // assert children get rendered
    expect(screen.queryByTestId('did-i-render')).toBeInTheDocument();
  });

  test('renders with no active refinements', () => {
    renderWithRouter(
      <MobileFilterMenuWrapper items={[]} />,
    );

    // assert that "3 selected" appears in both places (i.e., the button that opens
    // the modal and the modal header)
    expect(screen.queryAllByText('selected', { exact: false })).toHaveLength(0);

    // assert children get rendered
    expect(screen.queryByTestId('did-i-render')).toBeInTheDocument();
  });
});
