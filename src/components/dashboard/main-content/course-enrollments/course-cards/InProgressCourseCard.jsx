import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import BaseCourseCard from './BaseCourseCard';
import { MarkCompleteModal } from './mark-complete-modal';
import ContinueLearningButton from './ContinueLearningButton';

import Notification from './Notification';

import { CourseEnrollmentsContext } from '../CourseEnrollmentsContextProvider';

const InProgressCourseCard = ({
  linkToCourse,
  courseRunId,
  title,
  notifications,
  courseRunStatus,
  ...rest
}) => {
  const {
    updateCourseEnrollmentStatus,
    setShowMarkCourseCompleteSuccess,
  } = useContext(CourseEnrollmentsContext);
  const [isMarkCompleteModalOpen, setIsMarkCompleteModalOpen] = useState(false);
  const { courseCards, enterpriseConfig } = useContext(AppContext);

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
    const cardConfig = courseCards && courseCards['in-progress'];
    const settingsMenu = cardConfig ? cardConfig.settingsMenu : undefined;
    const hasMarkComplete = settingsMenu ? settingsMenu.hasMarkComplete : false;

    if (hasMarkComplete) {
      return [{
        key: 'mark-complete',
        type: 'button',
        onClick: () => {
          setIsMarkCompleteModalOpen(true);
          sendEnterpriseTrackEvent(
            enterpriseConfig.uuid,
            'edx.ui.enterprise.learner_portal.dashboard.course.mark_complete.modal.opened',
            {
              course_run_id: courseRunId,
            },
          );
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
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.course.mark_complete.modal.closed',
      {
        course_run_id: courseRunId,
      },
    );
  };

  const handleMarkCompleteModalOnSuccess = ({ response, resetModalState }) => {
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.course.mark_complete.saved',
      {
        course_run_id: courseRunId,
      },
    );
    setIsMarkCompleteModalOpen(false);
    resetModalState();
    updateCourseEnrollmentStatus(
      {
        courseRunId: response.courseRunId,
        originalStatus: courseRunStatus,
        newStatus: response.courseRunStatus,
        savedForLater: response.savedForLater,
      },
    );
    setShowMarkCourseCompleteSuccess(true);
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
              enterpriseUUID={enterpriseConfig.uuid}
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
  courseRunStatus: PropTypes.string.isRequired,
};

export default InProgressCourseCard;
