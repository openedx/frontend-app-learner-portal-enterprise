import React from 'react';
import PropTypes from 'prop-types';
import { useIntl, defineMessages } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

const messages = defineMessages({
  viewCourse: {
    id: 'useCourseRunCardAction.viewCourse',
    defaultMessage: 'View course',
    description: 'Label for button when learner is already enrolled.',
  },
});

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const BasicNavigateToCourseware = ({ courseRunUrl }) => {
  const intl = useIntl();
  return (
    <Button href={courseRunUrl}>
      {intl.formatMessage(messages.viewCourse)}
    </Button>
  );
};

BasicNavigateToCourseware.propTypes = {
  courseRunUrl: PropTypes.string.isRequired,
};

export default BasicNavigateToCourseware;
