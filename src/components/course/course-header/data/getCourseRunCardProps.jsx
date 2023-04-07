import React from 'react';
import { Button } from '@edx/paragon';
import moment from 'moment';

import StatefulEnroll from '../../../stateful-enroll';
import { isCourseSelfPaced } from '../../data/utils';
import { formatStringAsNumber } from '../../../../utils/common';

const DATE_FORMAT = 'MMM D';

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

const getCourseRunCardProps = ({
  courseRun,
  isUserEnrolled,
  courseRunUrl,
}) => {
  const {
    availability,
    start,
    pacingType,
  } = courseRun;
  const isCourseRunCurrent = availability.toLowerCase() === 'current';
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
    action: <StatefulEnroll contentKey={courseRun.key} />,
  };
};

export default getCourseRunCardProps;
