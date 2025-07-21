import { v4 as uuidv4 } from 'uuid';

import { COURSE_PACING_MAP } from '../../../../data';
import { COURSE_AVAILABILITY_MAP, COURSE_MODES_MAP, LEARNER_CREDIT_SUBSIDY_TYPE } from '../../../../../app/data';
import { POLICY_TYPES } from '../../../../../enterprise-user-subsidy/enterprise-offers/data/constants';

export const MOCK_COURSE_RUN_KEY = 'course-v1:edX+DemoX+Demo_Course';

export const MOCK_COURSE_RUN_URL = `http://localhost:2000/course/${MOCK_COURSE_RUN_KEY}/home`;

export const MOCK_COURSE_RUN_START = '2023-04-20T12:00:00Z';

export const MOCK_ENROLLMENT_VERIFIED = { mode: COURSE_MODES_MAP.VERIFIED };

export const MOCK_ENROLLMENT_AUDIT = { mode: COURSE_MODES_MAP.AUDIT };

export const MOCK_REDEEMABLE_SUBSIDY = {
  active: true,
  subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
  policyType: POLICY_TYPES.PER_LEARNER_CREDIT,
  spendLimit: null,
  perLearnerSpendLimit: null,
  perLearnerEnrollmentLimit: null,
  policyRedemptionUrl: 'http://policy-redemption.url',
};

export const MOCK_COURSE_RUN = {
  uuid: uuidv4(),
  key: MOCK_COURSE_RUN_KEY,
  availability: COURSE_AVAILABILITY_MAP.CURRENT,
  start: MOCK_COURSE_RUN_START,
  pacingType: COURSE_PACING_MAP.SELF_PACED,
};

export const MOCK_LEARNER_CREDIT_SUBSIDY = {
  discount: 100,
  subsidyType: 'learnerCredit',
};

export const MOCK_COURSEWARE_URL = 'https://edx.org';

export const MOCK_COURSE = { key: 'mock-course-key', title: 'Mock Course' };
