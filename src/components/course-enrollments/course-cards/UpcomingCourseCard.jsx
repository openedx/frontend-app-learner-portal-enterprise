import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import BaseCourseCard from './BaseCourseCard';

const UpcomingCourseCard = (props) => {
  const renderButtons = () => (
    <button className="btn btn-light btn-xs-block" disabled>
      Available on {moment(props.startDate).format('MMM D')}
    </button>
  );

  return (
    <BaseCourseCard type="upcoming" buttons={renderButtons()} {...props} />
  );
};

UpcomingCourseCard.propTypes = {
  startDate: PropTypes.string.isRequired,
};

export default UpcomingCourseCard;
