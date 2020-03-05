// eslint-disable-next-line import/prefer-default-export
export function isEmpty(obj) {
  if (typeof obj !== 'object') {
    return undefined;
  }
  return Object.keys(obj).length === 0;
}
