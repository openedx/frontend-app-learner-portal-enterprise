import { SUBJECTS } from './constants';
import {
  sortItemsByLabelAsc,
  updateRefinementsFromQueryParams,
} from '../utils';

describe('sortItemsByLabelAsc', () => {
  const APPLE = 'apple';
  const BANANA = 'banana';
  const CHERRY = 'cherry';

  test('correctly sorts items by label alphabetically', () => {
    const items = [{
      label: CHERRY,
    }, {
      label: APPLE,
    }, {
      label: BANANA,
    }];

    const expectedSortedItems = [{
      label: APPLE,
    }, {
      label: BANANA,
    }, {
      label: CHERRY,
    }];

    const sortedItems = sortItemsByLabelAsc(items);
    expect(sortedItems).toEqual(expectedSortedItems);
  });
});

describe('updateRefinementsFromQueryParams', () => {
  test('returns the correctly updated refinements', () => {
    const refinements = {
      subjects: [SUBJECTS.COMPUTER_SCIENCE, SUBJECTS.COMMUNICATION],
    };
    const expectedUpdatedRefinements = {
      subjects: `${SUBJECTS.COMPUTER_SCIENCE},${SUBJECTS.COMMUNICATION}`,
    };

    const updatedRefinements = updateRefinementsFromQueryParams(refinements);
    expect(updatedRefinements).toEqual(expectedUpdatedRefinements);
  });
});
