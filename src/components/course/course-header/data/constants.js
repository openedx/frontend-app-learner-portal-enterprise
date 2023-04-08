import { v4 as uuidv4 } from 'uuid';

import { COURSE_AVAILABILITY_MAP, COURSE_PACING_MAP } from '../../data/constants';

export const COURSE_RUN_KEY = 'course-v1:edX+DemoX+T2023';
export const COURSE_RUN = {
  uuid: uuidv4(),
  key: COURSE_RUN_KEY,
  availability: COURSE_AVAILABILITY_MAP.CURRENT,
  start: '2023-04-07',
  pacingType: COURSE_PACING_MAP.SELF_PACED,
};
export const COURSE_RUN_URL = `http://localhost:2000/course/${COURSE_RUN_KEY}/home`;

export const LEARNER_CREDIT_SUBSIDY = {
  discount: 100,
};

export const DATE_FORMAT = 'MMM D';
