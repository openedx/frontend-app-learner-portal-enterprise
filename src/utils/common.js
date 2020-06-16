import moment from 'moment';

const isCourseEnded = (endDate) => moment(endDate) < moment();

export {
  // eslint-disable-next-line import/prefer-default-export
  isCourseEnded,
};
