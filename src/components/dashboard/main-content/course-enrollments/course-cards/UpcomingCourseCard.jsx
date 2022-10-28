import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Button } from '@edx/paragon';
import BaseCourseCard from './BaseCourseCard';

const UpcomingCourseCard = (props) => {
  const renderButtons = () => (
    <Button className="btn-xs-block" variant="light" disabled>
      Available on {moment(props.startDate).format('MMM D')}
    </Button>
  );

  return (
    <BaseCourseCard type="upcoming" buttons={renderButtons()} {...props} />
  );
};

UpcomingCourseCard.propTypes = {
  startDate: PropTypes.string.isRequired,
};

export default UpcomingCourseCard;
