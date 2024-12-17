import PropTypes from 'prop-types';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import dayjs from '../../../../../utils/dayjs';

const Notification = props => (
  <li>
    <div className="notification p-2 mb-2 border rounded">
      <div className="row no-gutters">
        <div className="col-12">
          <a
            href={props.url}
            onClick={() => sendEnterpriseTrackEvent(
              props.enterpriseUUID,
              'edx.ui.enterprise.learner_portal.notification.clicked',
              { course_run_id: props.courseRunId, name: props.name },
            )}
          >
            {props.name}
          </a>
          {' is due '}
          <span className="font-weight-bold">
            {dayjs(props.date).fromNow()}
          </span>
          {' on '}
          {dayjs(props.date).format('ddd MMMM D, YYYY')}
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
  enterpriseUUID: PropTypes.string.isRequired,
};

export default Notification;
