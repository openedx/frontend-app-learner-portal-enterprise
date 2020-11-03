export const sortItemsByLabelAsc = items => (
  items.sort((a, b) => a.label.localeCompare(b.label))
);

export const updateRefinementsFromQueryParams = (refinements) => {
  const refinementsWithJoinedLists = {};
  Object.entries(refinements).forEach(([key, value]) => {
    let newValue = value;
    if (Array.isArray(value)) {
      newValue = value.join(',');
    }
    refinementsWithJoinedLists[key] = newValue;
  });

  return refinementsWithJoinedLists;
};
