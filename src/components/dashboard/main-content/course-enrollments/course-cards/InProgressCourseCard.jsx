import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { useNavigate } from 'react-router-dom';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import dayjs from '../../../../../utils/dayjs';
import BaseCourseCard from './BaseCourseCard';
import { MarkCompleteModal } from './mark-complete-modal';
import ContinueLearningButton from './ContinueLearningButton';

import Notification from './Notification';

import UpgradeCourseButton from './UpgradeCourseButton';
import { useEnterpriseCustomer } from '../../../../app/data';
import { useCourseUpgradeData, useUpdateCourseEnrollmentStatus } from '../data';

export const InProgressCourseCard = ({
  linkToCourse,
  courseRunId,
  title,
  notifications,
  courseRunStatus,
  startDate,
  mode,
  resumeCourseRunUrl,
  canUpgradeToVerifiedEnrollment,
  ...rest
}) => {
  // TODO: Import learnerCreditUpgradeUrl field
  const {
    isLoading: isLoadingUpgradeUrl,
    licenseUpgradeUrl,
    couponUpgradeUrl,
  } = useCourseUpgradeData({ courseRunKey: courseRunId, canUpgradeToVerifiedEnrollment });
  const navigate = useNavigate();

  // The upgrade button is only for upgrading via coupon, upgrades via license are automatic through the course link.
  const shouldShowUpgradeButton = !!couponUpgradeUrl;

  const [isMarkCompleteModalOpen, setIsMarkCompleteModalOpen] = useState(false);
  const { courseCards } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const updateCourseEnrollmentStatus = useUpdateCourseEnrollmentStatus({ enterpriseCustomer });

  const renderButtons = () => (
    <>
      <ContinueLearningButton
        className={shouldShowUpgradeButton ? 'btn-primary' : undefined}
        linkToCourse={licenseUpgradeUrl ?? linkToCourse}
        title={title}
        courseRunId={courseRunId}
        mode={mode}
        startDate={startDate}
        resumeCourseRunUrl={resumeCourseRunUrl}
      />
      {shouldShowUpgradeButton && <UpgradeCourseButton className="ml-1" title={title} courseRunKey={courseRunId} />}
    </>
  );

  const filteredNotifications = notifications.filter((notification) => {
    const now = dayjs();
    if (dayjs(notification.date).isBetween(now, dayjs(now).add('1', 'w'))) {
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
            enterpriseCustomer.uuid,
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
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.course.mark_complete.modal.closed',
      {
        course_run_id: courseRunId,
      },
    );
  };

  const handleMarkCompleteModalOnSuccess = ({ response, resetModalState }) => {
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.course.mark_complete.saved',
      {
        course_run_id: courseRunId,
      },
    );
    setIsMarkCompleteModalOpen(false);
    resetModalState();
    updateCourseEnrollmentStatus({
      courseRunId: response.courseRunId,
      newStatus: response.courseRunStatus,
      savedForLater: response.savedForLater,
    });
    navigate('.', {
      replace: true,
      state: {
        markedSavedForLaterSuccess: true,
        markedInProgressSuccess: false,
      },
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
              enterpriseUUID={enterpriseCustomer.uuid}
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
      linkToCourse={licenseUpgradeUrl ?? linkToCourse}
      courseRunId={courseRunId}
      isLoading={isLoadingUpgradeUrl}
      mode={mode}
      startDate={startDate}
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
  startDate: PropTypes.string,
  mode: PropTypes.string,
  resumeCourseRunUrl: PropTypes.string,
  canUpgradeToVerifiedEnrollment: PropTypes.bool.isRequired,
};

InProgressCourseCard.defaultProps = {
  startDate: null,
  mode: null,
  resumeCourseRunUrl: null,
};

export default InProgressCourseCard;
