import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { Button } from '@openedx/paragon';
import BaseCourseCard from './BaseCourseCard';

const UpcomingCourseCard = (props) => {
  const renderButtons = () => (
    <Button className="btn-xs-block" variant="light" disabled>
      Available on {dayjs(props.startDate).format('MMM D')}
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
