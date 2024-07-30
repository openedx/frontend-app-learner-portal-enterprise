import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { FormattedDate, FormattedMessage } from '@edx/frontend-platform/i18n';

import { Button } from '@openedx/paragon';
import BaseCourseCard from './BaseCourseCard';

const UpcomingCourseCard = (props) => {
  const renderButtons = () => (
    <Button className="btn-xs-block" variant="light" disabled>
      <FormattedMessage
        id="enterprise.dashboard.courses.tab.my.courses.section.available.date"
        defaultMessage="Available on {upcomingDate}"
        description="Label for the upcoming course card button"
        values={{
          upcomingDate: <FormattedDate
            value={dayjs(props.startDate).format('MMM D')}
            month="short"
            day="numeric"
          />,
        }}
      />
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
