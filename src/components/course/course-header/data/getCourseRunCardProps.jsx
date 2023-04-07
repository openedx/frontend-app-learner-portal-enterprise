import React from 'react';
import { Button } from '@edx/paragon';
import moment from 'moment';

import StatefulEnroll from '../../../stateful-enroll';
import { isCourseSelfPaced } from '../../data/utils';
import { formatStringAsNumber } from '../../../../utils/common';
import {
  COURSE_AVAILABILITY_MAP,
  LICENSE_SUBSIDY_TYPE,
  COUPON_CODE_SUBSIDY_TYPE,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
} from '../../data/constants';

const DATE_FORMAT = 'MMM D';

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const getCourseRunCardHeading = ({
  isCourseRunCurrent,
  pacingType,
  start,
  isUserEnrolled,
}) => {
  if (isCourseRunCurrent) {
    if (isCourseSelfPaced(pacingType) && !isUserEnrolled) {
      return `Starts ${moment().format(DATE_FORMAT)}`;
    }
    return 'Course started';
  }
  return `Starts ${moment(start).format(DATE_FORMAT)}`;
};

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const getCourseRunCardProps = ({
  courseRun,
  userSubsidyApplicableToCourse,
  isUserEnrolled,
  courseRunUrl,
}) => {
  console.log('getCourseRunCardProps (userSubsidyApplicableToCourse):', userSubsidyApplicableToCourse);

  const {
    availability,
    start,
    pacingType,
  } = courseRun;
  const isCourseRunCurrent = availability === COURSE_AVAILABILITY_MAP.CURRENT;

  const heading = getCourseRunCardHeading({
    isCourseRunCurrent,
    pacingType,
    start,
    isUserEnrolled,
  });

  if (isUserEnrolled) {
    return {
      heading,
      subHeading: 'You are enrolled',
      // TODO link to courseware_url from API response.
      action: <Button href={courseRunUrl}>View course</Button>,
    };
  }

  const { enrollmentCount } = courseRun;
  const subHeading = enrollmentCount > 0 ? `${formatStringAsNumber(enrollmentCount)} recently enrolled!` : 'Be the first to enroll!';

  return {
    heading,
    subHeading,
    // TODO: `StatefulEnroll` needs to know the UUID of the redeemable, applicable subsidy
    // access policy for the user and course run. Will be returned by `can_redeem` API endpoint.
    action: <StatefulEnroll contentKey={courseRun.key} />,
  };
};

export default getCourseRunCardProps;
