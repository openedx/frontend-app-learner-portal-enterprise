import React from 'react';
import { act, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { FREE_ALL_TITLE } from '../SearchFilters';

import FacetListBase from '../FacetListBase';
import { FACET_ATTRIBUTES, SUBJECTS } from '../data/tests/constants';
import { renderWithRouter } from '../../../utils/tests';
import { NO_OPTIONS_FOUND, SHOW_ALL_NAME } from '../data/constants';
import SearchData from '../SearchContext';

const propsForNoItems = {
  items: [],
  title: FREE_ALL_TITLE,
  attribute: SHOW_ALL_NAME,
  isBold: true,
  facetValueType: 'bool',
};

const FREE_LABEL = 'Free';
const NOT_FREE_LABEL = 'Not free';
const propsWithItems = {
  ...propsForNoItems,
  items: [{
    label: FREE_LABEL,
    value: 1,
  },
  {
    label: NOT_FREE_LABEL,
    value: 0,
  },
  ],
  refinementsFromQueryParams: {
    [FACET_ATTRIBUTES.SUBJECTS]: [SUBJECTS.COMMUNICATION],
    page: 3,
  },
};

describe('<FacetListBase />', () => {
  test('renders with no options', async () => {
    renderWithRouter(<SearchData><FacetListBase {...propsForNoItems} /></SearchData>);

    // assert facet title exists
    expect(screen.queryByText(FREE_ALL_TITLE)).toBeInTheDocument();

    // assert there are no options
    await act(async () => {
      fireEvent.click(screen.queryByText(FREE_ALL_TITLE));
    });
    expect(screen.queryByText(NO_OPTIONS_FOUND)).toBeInTheDocument();
  });

  test('renders with options', async () => {
    renderWithRouter(<SearchData><FacetListBase {...propsWithItems} /></SearchData>);

    // assert the "no options" message does not show
    expect(screen.queryByText(NO_OPTIONS_FOUND)).not.toBeInTheDocument();

    // assert the refinements appear with appropriate counts
    await act(async () => {
      fireEvent.click(screen.queryByText(FREE_ALL_TITLE));
    });
    expect(screen.queryByText(FREE_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(NOT_FREE_LABEL)).toBeInTheDocument();
  });

  test('renders with options', async () => {
    renderWithRouter(<SearchData><FacetListBase {...propsWithItems} /></SearchData>);

    // assert the "no options" message does not show
    await act(async () => {
      fireEvent.click(screen.queryByText(FREE_ALL_TITLE));
    });
    expect(screen.queryByText(NO_OPTIONS_FOUND)).not.toBeInTheDocument();

    // assert the refinements appear with appropriate styles
    expect(screen.queryByText(FREE_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(FREE_LABEL)).toHaveClass('is-refined');

    expect(screen.queryByText(NOT_FREE_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(NOT_FREE_LABEL)).not.toHaveClass('is-refined');
  });

  test('supports clicking on a refinement', async () => {
    const { history } = renderWithRouter(
      <SearchData>
        <FacetListBase
          {...propsWithItems}
        />
      </SearchData>,
    );

    // assert the refinements appear
    await act(async () => {
      fireEvent.click(screen.queryByText(FREE_ALL_TITLE));
    });
    expect(screen.queryByText(FREE_LABEL)).toBeInTheDocument();

    // click a refinement option
    await act(async () => {
      fireEvent.click(screen.queryByText(NOT_FREE_LABEL));
    });

    expect(history.location.search).toEqual('?showAll=1');
  });
  test('clears pagination when clicking on a refinement', async () => {
    const { history } = renderWithRouter(
      <SearchData>
        <FacetListBase
          {...propsWithItems}
        />
      </SearchData>,
      { route: '/search?subjects=Communication&page=3' },
    );

    // assert the refinements appear
    await act(async () => {
      fireEvent.click(screen.queryByText(FREE_ALL_TITLE));
    });
    // click a refinement option
    await act(async () => {
      fireEvent.click(screen.queryByText(NOT_FREE_LABEL));
    });

    // assert page was deleted and subjects were not
    expect(history.location.search).toEqual('?showAll=1&subjects=Communication');
  });
});
