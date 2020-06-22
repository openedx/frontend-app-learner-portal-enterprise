import moment from 'moment';

export const isCourseEnded = endDate => moment(endDate) < moment();

export const createArrayFromValue = (value) => {
  const values = [];
  switch (typeof value) {
    case 'array':
      values.concat(value);
      break;
    default:
      values.push(value);
      break;
  }
  return values;
};

export const isDefined = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => item !== undefined);
};

export const isNull = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => item === null);
};

export const isDefinedAndNotNull = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => isDefined(item) && item !== null);
};

export const isDefinedAndNull = (value) => {
  const values = createArrayFromValue(value);
  return values.every(item => isDefined(item) && item === null);
};
