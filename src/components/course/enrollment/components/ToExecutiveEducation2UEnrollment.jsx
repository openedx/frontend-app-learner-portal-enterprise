import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { Link } from 'react-router-dom';

import { useTrackSearchConversionClickHandler } from '../../data/hooks';
import { EVENT_NAMES } from '../../data/constants';

const ButtonAsLink = ({ children, ...props }) => (
  <Button as={Link} {...props}>
    {children}
  </Button>
);

ButtonAsLink.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string.isRequired,
};

/**
 * Renders a hyperlink to the ExecutiveEducation2UPage
 */
const ToExecutiveEducation2UEnrollment = ({
  enrollmentUrl,
}) => {
  const handleSearchConversionStart = useTrackSearchConversionClickHandler({
    eventName: EVENT_NAMES.clickedToEnrollPage,
  });

  return (
    <Button
      as={ButtonAsLink}
      to={enrollmentUrl}
      onClick={handleSearchConversionStart}
      block
    >
      Enroll
    </Button>
  );
};

ToExecutiveEducation2UEnrollment.propTypes = {
  enrollmentUrl: PropTypes.string.isRequired,
};

export default ToExecutiveEducation2UEnrollment;
