import moment from 'moment';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

import { isCourseSelfPaced } from '../../../data/utils';
import { DATE_FORMAT } from '../constants';

const messages = defineMessages({
  courseStartDate: {
    id: 'useCourseRunCardHeading.headingUpcoming',
    defaultMessage: 'Starts {startDate}',
    description: 'Heading for course run card when course start date is shown.',
  },
  courseStarted: {
    id: 'useCourseRunCardHeading.currentInstructorLedOrEnrolled',
    defaultMessage: 'Course started',
    description: 'Heading for course run card when course run is shown as already started.',
  },
});

/**
 * Determines the heading to display on the course run card.
 * @param {object} args
 * @param {boolean} args.isCourseRunCurrent Whether the course run is current.
 * @param {string} args.pacingType The pacing type (e.g., self-paced) for the course run.
 * @param {string} args.start The start date for the course run.
 * @param {boolean} args.isUserEnrolled Whether the user is already enrolled in the course run.
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
      return intl.formatMessage(messages.courseStartDate, {
        startDate: moment().format(DATE_FORMAT),
      });
    }
    return intl.formatMessage(messages.courseStarted);
  }
  return intl.formatMessage(messages.courseStartDate, {
    startDate: moment(start).format(DATE_FORMAT),
  });
};

export default useCourseRunCardHeading;
