import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { AppContext } from '@edx/frontend-platform/react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import BaseCourseCard from './BaseCourseCard';
import { MarkCompleteModal } from './mark-complete-modal';
import ContinueLearningButton from './ContinueLearningButton';

import Notification from './Notification';

import {
  updateCourseRunStatus,
  updateIsMarkCourseCompleteSuccess,
} from '../data/actions';

const InProgressCourseCard = ({
  linkToCourse,
  courseRunId,
  title,
  notifications,
  modifyCourseRunStatus,
  modifyIsMarkCourseCompleteSuccess,
  ...rest
}) => {
  const [isMarkCompleteModalOpen, setIsMarkCompleteModalOpen] = useState(false);

  const renderButtons = () => (
    <ContinueLearningButton
      linkToCourse={linkToCourse}
      title={title}
      courseRunId={courseRunId}
    />
  );

  const filteredNotifications = notifications.filter((notification) => {
    const now = moment();
    if (moment(notification.date).isBetween(now, moment(now).add('1', 'w'))) {
      return notification;
    }
    return false;
  });

  const getDropdownMenuItems = () => {
    const { courseCards } = useContext(AppContext);
    const cardConfig = courseCards && courseCards['in-progress'];
    const settingsMenu = cardConfig ? cardConfig.settingsMenu : undefined;
    const hasMarkComplete = settingsMenu ? settingsMenu.hasMarkComplete : false;

    if (hasMarkComplete) {
      return [{
        key: 'mark-complete',
        type: 'button',
        onClick: () => {
          setIsMarkCompleteModalOpen(true);
          sendTrackEvent('edx.learner_portal.dashboard.course.mark_complete.modal.opened', {
            course_run_id: courseRunId,
          });
        },
        children: (
          <>
            Save course for later
            <span className="sr-only">for {title}</span>
          </>
        ),
      }];
    }
    return [];
  };

  const handleMarkCompleteModalOnClose = () => {
    setIsMarkCompleteModalOpen(false);
    sendTrackEvent('edx.learner_portal.dashboard.course.mark_complete.modal.closed', {
      course_run_id: courseRunId,
    });
  };

  const handleMarkCompleteModalOnSuccess = ({ response, resetModalState }) => {
    sendTrackEvent('edx.learner_portal.dashboard.course.mark_complete.saved', {
      course_run_id: courseRunId,
    });
    setIsMarkCompleteModalOpen(false);
    resetModalState();
    modifyCourseRunStatus({
      status: response.courseRunStatus,
      courseId: response.courseRunId,
      savedForLater: response.savedForLater,
    });
    modifyIsMarkCourseCompleteSuccess({
      isSuccess: true,
    });
  };

  const renderNotifications = () => {
    if (!filteredNotifications.length) {
      return null;
    }
    return (
      <div className="notifications mb-3">
        <ul
          className="list-unstyled mb-0"
          aria-label="course due dates"
        >
          {filteredNotifications.map(notificationProps => (
            <Notification
              key={`notification-${notificationProps.url}-${notificationProps.date}`}
              courseRunId={courseRunId}
              {...notificationProps}
            />
          ))}
        </ul>
      </div>
    );
  };

  return (
    <BaseCourseCard
      type="in_progress"
      buttons={renderButtons()}
      dropdownMenuItems={getDropdownMenuItems()}
      title={title}
      linkToCourse={linkToCourse}
      courseRunId={courseRunId}
      {...rest}
    >
      {renderNotifications()}
      <MarkCompleteModal
        isOpen={isMarkCompleteModalOpen}
        courseTitle={title}
        courseLink={linkToCourse}
        courseId={courseRunId}
        onClose={handleMarkCompleteModalOnClose}
        onSuccess={handleMarkCompleteModalOnSuccess}
      />
    </BaseCourseCard>
  );
};

InProgressCourseCard.propTypes = {
  linkToCourse: PropTypes.string.isRequired,
  courseRunId: PropTypes.string.isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  })).isRequired,
  title: PropTypes.string.isRequired,
  modifyCourseRunStatus: PropTypes.func.isRequired,
  modifyIsMarkCourseCompleteSuccess: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  modifyCourseRunStatus: (options) => {
    dispatch(updateCourseRunStatus(options));
  },
  modifyIsMarkCourseCompleteSuccess: (options) => {
    dispatch(updateIsMarkCourseCompleteSuccess(options));
  },
});

export default connect(null, mapDispatchToProps)(InProgressCourseCard);
