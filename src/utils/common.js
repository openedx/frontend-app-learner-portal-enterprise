import moment from 'moment';

const courseEnded = (endDate) => moment(endDate) < moment();

export {
  // eslint-disable-next-line import/prefer-default-export
  courseEnded,
};
