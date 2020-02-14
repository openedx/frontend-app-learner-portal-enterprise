import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

const Notification = props => (
  <li>
    <div className="notification p-2 mb-2 border rounded">
      <div className="row no-gutters">
        <div className="col-12">
          <a
            className="text-underline"
            href={props.url}
            onClick={() => { sendTrackEvent('edx.learner_portal.notification.clicked', { course_run_id: props.courseRunId, name: props.name }); }}
          >
            {props.name}
          </a>
          {' is due '}
          <span className="font-weight-bold">
            {moment(props.date).fromNow()}
          </span>
          {' on '}
          {moment(props.date).format('ddd MMMM D, YYYY')}
        </div>
      </div>
    </div>
  </li>
);

Notification.propTypes = {
  name: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  courseRunId: PropTypes.string.isRequired,
};

export default Notification;
