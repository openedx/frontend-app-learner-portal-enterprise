import React from 'react';
import { act, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { FacetListBase } from '../FacetListRefinement';

import { renderWithRouter } from '../../../utils/tests';
import { FACET_ATTRIBUTES, SUBJECTS } from '../data/tests/constants';
import { NO_OPTIONS_FOUND } from '../data/constants';

const propsForNoRefinements = {
  items: [],
  attribute: FACET_ATTRIBUTES.SUBJECTS,
  title: FACET_ATTRIBUTES.SUBJECTS,
  currentRefinement: [],
  refinementsFromQueryParams: {},
};

const propsForRefinements = {
  ...propsForNoRefinements,
  items: [{
    label: SUBJECTS.COMMUNICATION,
    value: [SUBJECTS.COMMUNICATION],
    count: 10,
    isRefined: false,
  }],
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
  refinementsFromQueryParams: {
    [FACET_ATTRIBUTES.SUBJECTS]: [SUBJECTS.COMPUTER_SCIENCE],
  },
};

describe('<FacetListRefinement />', () => {
  test('renders with no options', async () => {
    renderWithRouter(<FacetListBase {...propsForNoRefinements} />);

    // assert facet title exists
    expect(screen.queryByText(FACET_ATTRIBUTES.SUBJECTS)).toBeInTheDocument();

    // assert there are no options
    await act(async () => {
      fireEvent.click(screen.queryByText(FACET_ATTRIBUTES.SUBJECTS));
    });
    expect(screen.queryByText(NO_OPTIONS_FOUND)).toBeInTheDocument();
  });

  test('renders with options', async () => {
    renderWithRouter(<FacetListBase {...propsForActiveRefinements} />);

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
    renderWithRouter(<FacetListBase {...propsForActiveRefinements} />);

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
    const { history } = renderWithRouter(<FacetListBase {...propsForRefinements} />);

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
    expect(history.location.search).toEqual('?subjects=Communication');
  });
});
