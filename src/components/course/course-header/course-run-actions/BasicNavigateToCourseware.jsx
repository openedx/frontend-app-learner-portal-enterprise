import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';

import { messages } from './data';

/**
 * Renders a hyperlink styled as a button that navigates to the courseware.
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
