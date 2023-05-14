import moment from 'moment';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

import { hasTimeToComplete, isCourseSelfPaced } from '../../../data/utils';
import { DATE_FORMAT } from '../constants';

const messages = defineMessages({
  courseStartDate: {
    id: 'useCourseRunCardHeading.startsOnDate',
    defaultMessage: 'Starts {startDate}',
    description: 'Heading for course run card when the course run is upcoming or the course run is self-paced.',
  },
  courseStarted: {
    id: 'useCourseRunCardHeading.courseStarted',
    defaultMessage: 'Course started',
    description: 'Heading for course run card when course run is shown as already started, with no date shown.',
  },
  courseStartedDate: {
    id: 'useCourseRunCardHeading.startedOnDate',
    defaultMessage: 'Started {startDate}',
    description: 'Heading for course run card when course run is shown as already started, with its start date shown.',
  },
});

/**
 * Determines the heading to display on the course run card.
 * @param {object} args
 * @param {boolean} args.isCourseRunCurrent Whether the course run is current.
 * @param {object} args.courseRun Data about the course run for the course run card.
 * @param {boolean} args.isUserEnrolled Whether the user is already enrolled in the course run.
 * @returns {string} The heading to display on the course run card.
 */
const useCourseRunCardHeading = ({
  isCourseRunCurrent,
  courseRun,
  isUserEnrolled,
}) => {
  const intl = useIntl();
  if (isCourseRunCurrent) {
    if (isUserEnrolled) {
      return intl.formatMessage(messages.courseStarted);
    }
    if (isCourseSelfPaced(courseRun.pacingType)) {
      if (hasTimeToComplete(courseRun)) {
        // always today's date (incentives enrollment)
        return intl.formatMessage(messages.courseStartDate, {
          startDate: moment().format(DATE_FORMAT),
        });
      }
      return intl.formatMessage(messages.courseStartedDate, {
        startDate: moment(courseRun.start).format(DATE_FORMAT),
      });
    }
    return intl.formatMessage(messages.courseStartedDate, {
      startDate: moment(courseRun.start).format(DATE_FORMAT),
    });
  }
  return intl.formatMessage(messages.courseStartDate, {
    startDate: moment(courseRun.start).format(DATE_FORMAT),
  });
};

export default useCourseRunCardHeading;
