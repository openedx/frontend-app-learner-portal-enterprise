import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { SearchPaginationBase } from '../SearchPagination';

import { renderWithRouter } from '../../../utils/tests';
import SearchData from '../SearchContext';

describe('<SearchPagination />', () => {
  test('updates url when navigating right', () => {
    const { history } = renderWithRouter(<SearchData><SearchPaginationBase nbPages={3} /></SearchData>);

    // assert no initial page query parameter
    expect(history.location.search).toEqual('?showAll=0');

    // click on next button and assert page query parameter exists and is accurate
    fireEvent.click(screen.queryByText('Navigate Right'));
    expect(history.location.search).toEqual('?page=2&showAll=0');
  });
  test('deletes page query when navigating to the first page', () => {
    const { history } = renderWithRouter(
      <SearchData>
        <SearchPaginationBase nbPages={3} currentRefinement={2} />
      </SearchData>,
      { route: 'search/?page=2&showAll=0' },
    );

    // assert SearchData adds showAll
    expect(history.location.search).toEqual('?page=2&showAll=0');

    // click on prev button and assert page disappears
    fireEvent.click(screen.queryByText('Navigate Left'));
    expect(history.location.search).toEqual('?showAll=0');
  });
  test('updates page query when navigating left to a previous page', () => {
    const { history } = renderWithRouter(
      <SearchData>
        <SearchPaginationBase nbPages={4} currentRefinement={3} />
      </SearchData>, {
        route: 'search/?page=3&showAll=0',
      },
    );

    // assert SearchData adds showAll
    expect(history.location.search).toEqual('?page=3&showAll=0');

    // click on prev button and assert page disappears
    fireEvent.click(screen.queryByText('Navigate Left'));
    expect(history.location.search).toEqual('?page=2&showAll=0');
  });
});
