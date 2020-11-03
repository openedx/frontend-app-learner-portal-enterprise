import React from 'react';
import { act, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { FacetListRefinementBase } from '../FacetListRefinement';

import { renderWithRouter } from '../../../utils/tests';
import { FACET_ATTRIBUTES, SUBJECTS } from '../data/tests/constants';
import { NO_OPTIONS_FOUND } from '../data/constants';
import SearchData from '../SearchContext';

const propsForNoRefinements = {
  items: [],
  attribute: FACET_ATTRIBUTES.SUBJECTS,
  title: FACET_ATTRIBUTES.SUBJECTS,
  currentRefinement: [],
  facetValueType: 'array',
  refinementsFromQueryParams: {},
  facetName: 'subjects',
};

const propsForRefinements = {
  ...propsForNoRefinements,
  items: [{
    label: SUBJECTS.COMMUNICATION,
    value: [SUBJECTS.COMMUNICATION],
    count: 10,
    isRefined: false,
  }],
  facetValueType: 'array',
  refinementsFromQueryParams: {},
};

const propsForActiveRefinements = {
  ...propsForNoRefinements,
  items: [{
    label: SUBJECTS.COMPUTER_SCIENCE,
    value: [SUBJECTS.COMPUTER_SCIENCE],
    count: 10,
    isRefined: true,
  }, {
    label: SUBJECTS.COMMUNICATION,
    value: [SUBJECTS.COMMUNICATION],
    count: 4,
    isRefined: false,
  }],
  currentRefinement: [SUBJECTS.COMPUTER_SCIENCE],
  facetValueType: 'array',
  refinementsFromQueryParams: { [FACET_ATTRIBUTES.SUBJECTS]: [SUBJECTS.COMPUTER_SCIENCE] },
};

describe('<FacetListRefinementBase />', () => {
  test('renders with no options', async () => {
    renderWithRouter(<SearchData><FacetListRefinementBase {...propsForNoRefinements} /></SearchData>);

    // assert facet title exists
    expect(screen.queryByText(FACET_ATTRIBUTES.SUBJECTS)).toBeInTheDocument();

    // assert there are no options
    await act(async () => {
      fireEvent.click(screen.queryByText(FACET_ATTRIBUTES.SUBJECTS));
    });
    expect(screen.queryByText(NO_OPTIONS_FOUND)).toBeInTheDocument();
  });

  test('renders with options', async () => {
    renderWithRouter(<SearchData><FacetListRefinementBase {...propsForActiveRefinements} /></SearchData>);

    // assert the "no options" message does not show
    expect(screen.queryByText(NO_OPTIONS_FOUND)).not.toBeInTheDocument();

    // assert the refinements appear with appropriate counts
    await act(async () => {
      fireEvent.click(screen.queryByText(FACET_ATTRIBUTES.SUBJECTS));
    });

    expect(screen.queryByText(SUBJECTS.COMPUTER_SCIENCE)).toBeInTheDocument();
    expect(screen.queryByText('10')).toBeInTheDocument();
    expect(screen.queryByText(SUBJECTS.COMMUNICATION)).toBeInTheDocument();
    expect(screen.queryByText('4')).toBeInTheDocument();
  });

  test('renders with options', async () => {
    renderWithRouter(<SearchData><FacetListRefinementBase {...propsForActiveRefinements} /></SearchData>);

    // assert the "no options" message does not show
    await act(async () => {
      fireEvent.click(screen.queryByText(FACET_ATTRIBUTES.SUBJECTS));
    });
    expect(screen.queryByText(NO_OPTIONS_FOUND)).not.toBeInTheDocument();

    // assert the refinements appear with appropriate counts
    expect(screen.queryByText(SUBJECTS.COMPUTER_SCIENCE)).toBeInTheDocument();
    expect(screen.queryByText(SUBJECTS.COMPUTER_SCIENCE)).toHaveClass('is-refined');
    expect(screen.queryByText('10')).toBeInTheDocument();

    expect(screen.queryByText(SUBJECTS.COMMUNICATION)).toBeInTheDocument();
    expect(screen.queryByText(SUBJECTS.COMMUNICATION)).not.toHaveClass('is-refined');
    expect(screen.queryByText('4')).toBeInTheDocument();
  });

  test('supports clicking on a refinement', async () => {
    const { history } = renderWithRouter(<SearchData><FacetListRefinementBase {...propsForRefinements} /></SearchData>);

    // assert the refinements appear
    await act(async () => {
      fireEvent.click(screen.queryByText(FACET_ATTRIBUTES.SUBJECTS));
    });
    expect(screen.queryByText(SUBJECTS.COMMUNICATION)).toBeInTheDocument();

    // click a refinement option
    await act(async () => {
      fireEvent.click(screen.queryByText(SUBJECTS.COMMUNICATION));
    });

    // assert the clicked refinement was added to the url
    expect(history.location.search).toEqual('?showAll=0&subjects=Communication');
  });

  test('clears pagination when clicking on a refinement', async () => {
    const { history } = renderWithRouter(
      <SearchData>
        <FacetListRefinementBase
          {...propsForActiveRefinements}
          refinementsFromQueryParams={{ ...propsForActiveRefinements.refinementsFromQueryParams, page: 3 }}
        />
      </SearchData>,
      { route: '/search?page=3' },
    );

    // assert the refinements appear
    await act(async () => {
      fireEvent.click(screen.queryByText(FACET_ATTRIBUTES.SUBJECTS));
    });
    // click a refinement option
    await act(async () => {
      fireEvent.click(screen.queryByText(SUBJECTS.COMMUNICATION));
    });

    // assert page was deleted and subjects were not
    expect(history.location.search).toEqual('?showAll=0&subjects=Communication');
  });
});
