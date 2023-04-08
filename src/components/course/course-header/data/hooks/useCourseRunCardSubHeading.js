import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

import { formatStringAsNumber } from '../../../../../utils/common';

const messages = defineMessages({
  enrolled: {
    id: 'useCourseRunCardSubHeading.enrolled',
    defaultMessage: 'You are enrolled',
    description: 'Sub-heading for course run card when user is enrolled.',
  },
  firstToEnroll: {
    id: 'useCourseRunCardSubHeading.firstToEnroll',
    defaultMessage: 'Be the first to enroll!',
    description: 'Sub-heading for course run card when course run has no enrollments.',
  },
  enrollmentCount: {
    id: 'useCourseRunCardSubHeading.enrollmentCount',
    defaultMessage: '{enrollmentCount} recently enrolled!',
    description: 'Sub-heading for course run card when course run has enrollments.',
  },
});

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const useCourseRunCardSubHeading = ({
  enrollmentCount,
  isUserEnrolled,
}) => {
  const intl = useIntl();

  if (isUserEnrolled) {
    return intl.formatMessage(messages.enrolled);
  }
  if (enrollmentCount === 0) {
    return intl.formatMessage(messages.firstToEnroll);
  }
  return intl.formatMessage(messages.enrollmentCount, {
    enrollmentCount: formatStringAsNumber(enrollmentCount),
  });
};

export default useCourseRunCardSubHeading;
