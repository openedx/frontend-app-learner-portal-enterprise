import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { SearchBoxBase } from '../SearchBox';

import { renderWithRouter } from '../../../utils/tests';

const TEST_QUERY = 'test query';

describe('<SearchBox />', () => {
  test('renders with a label', () => {
    const refinements = {};
    renderWithRouter(<SearchBoxBase refinementsFromQueryParams={refinements} />);

    // assert the Paragon <SearchField /> component renders
    expect(screen.queryByRole('search')).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).toBeInTheDocument();

    // assert our custom label for the input renders
    expect(screen.getByLabelText('Search Courses')).toBeInTheDocument();
  });

  test('renders with an initial value', () => {
    const refinements = {
      q: TEST_QUERY,
    };
    const Component = () => (
      <SearchBoxBase
        refinementsFromQueryParams={refinements}
        defaultRefinement={TEST_QUERY}
      />
    );
    renderWithRouter(<Component />);

    // assert the Paragon <SearchField /> component renders
    expect(screen.queryByRole('searchbox')).toHaveAttribute('value', TEST_QUERY);
  });

  test('handles submit', () => {
    const refinements = {};
    const { history } = renderWithRouter(<SearchBoxBase refinementsFromQueryParams={refinements} />);

    // fill in search input and submit the search
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: TEST_QUERY } });
    fireEvent.click(screen.getByText('submit search'));

    // assert url is updated with the query
    expect(history).toHaveLength(2);
    expect(history.location.search).toEqual('?q=test%20query');
  });

  test('handles clear', async () => {
    const refinements = {
      q: TEST_QUERY,
      page: 2,
    };
    const Component = () => (
      <SearchBoxBase
        refinementsFromQueryParams={refinements}
        defaultRefinement={TEST_QUERY}
      />
    );
    const { history } = renderWithRouter(<Component />, {
      route: '/?q=test%20query&page=2',
    });

    // assert query initially exists in url
    expect(history.location.search).toEqual('?q=test%20query&page=2');

    // clear the input
    fireEvent.click(screen.getByText('clear search'));

    // assert query no longer exists in url
    expect(history).toHaveLength(2);
    expect(history.location.search).toEqual('');
  });
});
