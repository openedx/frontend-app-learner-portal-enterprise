import { QUERY_PARAMS_TO_IGNORE } from './constants';

export const sortItemsByLabelAsc = items => (
  items.sort((a, b) => a.label.localeCompare(b.label))
);

export const updateRefinementsFromQueryParams = (refinements) => {
  const newRefinements = { ...refinements };
  Object.entries(newRefinements).forEach(([key, value]) => {
    if (!QUERY_PARAMS_TO_IGNORE.includes(key)) {
      newRefinements[key] = value.join(',');
    }
  });
  return newRefinements;
};
