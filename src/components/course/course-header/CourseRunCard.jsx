import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';

import DeprecatedCourseRunCard from './deprecated/CourseRunCard';

const CourseRunCard = ({
  heading,
  subHeading,
  action,
}) => (
  <Card>
    <Card.Section>
      <div className="text-center">
        <div className="h4 mb-0">{heading}</div>
        <p className="small">{subHeading}</p>
        {action}
      </div>
    </Card.Section>
  </Card>
);

CourseRunCard.propTypes = {
  heading: PropTypes.elementType.isRequired,
  subHeading: PropTypes.elementType.isRequired,
  action: PropTypes.node.isRequired,
};

CourseRunCard.Deprecated = DeprecatedCourseRunCard;

export default CourseRunCard;
