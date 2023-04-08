import moment from 'moment';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

import { isCourseSelfPaced } from '../../../data/utils';
import { DATE_FORMAT } from '../constants';

const messages = defineMessages({
  upcoming: {
    id: 'useCourseRunCardHeading.headingUpcoming',
    defaultMessage: 'Starts {startDate}',
    description: 'Heading for course run card when course run is upcoming.',
  },
  currentSelfPacedNotEnrolled: {
    id: 'useCourseRunCardHeading.currentSelfPacedNotEnrolled',
    defaultMessage: 'Starts {startDate}',
    description: 'Heading for course run card when course run is current, self-paced, and the learner is not enrolled.',
  },
  currentInstructorLedOrEnrolled: {
    id: 'useCourseRunCardHeading.currentInstructorLedOrEnrolled',
    defaultMessage: 'Course started',
    description: 'Heading for course run card when course run is current and either the course run is instructor-led or learner is enrolled.',
  },
});

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const useCourseRunCardHeading = ({
  isCourseRunCurrent,
  pacingType,
  start,
  isUserEnrolled,
}) => {
  const intl = useIntl();

  if (isCourseRunCurrent) {
    if (isCourseSelfPaced(pacingType) && !isUserEnrolled) {
      // always today's date (incentives enrollment)
      return intl.formatMessage(messages.currentSelfPacedNotEnrolled, {
        startDate: moment().format(DATE_FORMAT),
      });
    }
    return intl.formatMessage(messages.currentInstructorLedOrEnrolled);
  }
  return intl.formatMessage(messages.currentSelfPacedNotEnrolled, {
    startDate: moment(start).format(DATE_FORMAT),
  });
};

export default useCourseRunCardHeading;
