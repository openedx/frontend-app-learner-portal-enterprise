import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { Link } from 'react-router-dom';

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
}) => (
  <Button
    as={ButtonAsLink}
    to={enrollmentUrl}
    block
  >
    Enroll
  </Button>
);

ToExecutiveEducation2UEnrollment.propTypes = {
  enrollmentUrl: PropTypes.string.isRequired,
};

export default ToExecutiveEducation2UEnrollment;
