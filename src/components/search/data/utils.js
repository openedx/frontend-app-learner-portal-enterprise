// eslint-disable-next-line import/prefer-default-export
export const sortItemsByLabelAsc = items => (
  items.sort((a, b) => a.label.localeCompare(b.label))
);
