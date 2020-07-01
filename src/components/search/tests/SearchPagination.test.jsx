import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { SearchPaginationBase } from '../SearchPagination';

import { renderWithRouter } from '../../../utils/tests';

describe('<SearchPagination />', () => {
  test('updates url query parameter on page change', () => {
    const { history } = renderWithRouter(<SearchPaginationBase nbPages={3} />);

    // assert no initial page query parameter
    expect(history.location.search).toEqual('');

    // click on next button and assert page query parameter exists and is accurate
    fireEvent.click(screen.queryByText('Navigate Right'));
    expect(history.location.search).toEqual('?page=2');

    // click on prev button and assert page disappears
    fireEvent.click(screen.queryByText('Navigate Left'));
    expect(history.location.search).toEqual('');
  });
});
