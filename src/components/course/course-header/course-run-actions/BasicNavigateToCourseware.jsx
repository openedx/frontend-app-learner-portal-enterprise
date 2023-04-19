import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import { messages } from './data';

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
