export const toISOStringWithoutMilliseconds = (isoString) => {
  if (isoString.indexOf('.') === -1) {
    return undefined;
  }
  return `${isoString.split('.')[0]}Z`;
};
