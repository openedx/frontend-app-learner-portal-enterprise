import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { defineMessages, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import dayjs from '../../../../../utils/dayjs';
import BaseCourseCard, { getScreenReaderText } from './BaseCourseCard';
import { MarkCompleteModal } from './mark-complete-modal';
import ContinueLearningButton from './ContinueLearningButton';

import Notification from './Notification';

import UpgradeCourseButton from './UpgradeCourseButton';
import { LICENSE_SUBSIDY_TYPE, EXECUTIVE_EDUCATION_COURSE_MODES, useEnterpriseCustomer } from '../../../../app/data';
import { useCourseUpgradeData, useUpdateCourseEnrollmentStatus } from '../data';
import { COURSE_STATUSES } from '../../../../../constants';
import UpgradeCourseButton from './UpgradeCourseButton';

const messages = defineMessages({
  saveCourseForLater: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.save_for_later',
    defaultMessage: 'Save course for later <s>for {courseTitle}</s>',
    description: 'Text for the save course for later button in the course card dropdown menu',
  },
  upgradeCourseOriginalPrice: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.upgrade_course_original_price',
    defaultMessage: 'Original price:',
    description: 'Text for the course info outline upgrade original price in the course card dropdown menu',
  },
  upgradeCoursePriceStrikethrough: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.upgrade_course_price_strikethrough',
    defaultMessage: '{courseRunPrice} USD',
    description: 'Text for the course info outline price strikethrough in the course card dropdown menu',
  },
  upgradeCourseFree: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.upgrade_course_free',
    defaultMessage: 'FREE',
    description: 'Text for the course info outline upgrade "FREE" text in the course card dropdown menu',
  },
  upgradeCourseCoveredByOrganization: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.upgrade_course_covered_by_organization',
    defaultMessage: 'Covered by your organization',
    description: 'Text for the course info outline upgrade covered by organization in the course card dropdown menu',
  },
});

function useLinkToCourse({
  linkToCourse,
  subsidyForCourse,
}) {
  let url = linkToCourse;
  // For subscription upgrades, there is no upgrade confirmation required by the user
  // so we can directly redirect the user to the upgrade path when the `subsidyForCourse`
  // is a subscription license.
  if (subsidyForCourse?.subsidyType === LICENSE_SUBSIDY_TYPE) {
    url = subsidyForCourse.redemptionUrl;
  }
  return url;
}

export const InProgressCourseCard = ({
  linkToCourse,
  courseRunId,
  title,
  notifications,
  courseRunStatus,
  startDate,
  resumeCourseRunUrl,
  mode,
  ...rest
}) => {
  const navigate = useNavigate();
  const intl = useIntl();
  const {
    subsidyForCourse,
    hasUpgradeAndConfirm,
          courseRunPrice,
  } = useCourseUpgradeData({ courseRunKey: courseRunId, mode });
  const [isMarkCompleteModalOpen, setIsMarkCompleteModalOpen] = useState(false);
  const { courseCards } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const updateCourseEnrollmentStatus = useUpdateCourseEnrollmentStatus({ enterpriseCustomer });
  const isExecutiveEducation = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);

 const coursewareOrUpgradeLink = useLinkToCourse({
    linkToCourse,
    subsidyForCourse,
  });

  const renderButtons = () => (
    <Stack direction="horizontal" gap={1}>
     {hasUpgradeAndConfirm && (
        <UpgradeCourseButton
      variant={isExecutiveEducation ? 'inverse-brand' : 'brand'}
          title={title}
          courseRunKey={courseRunId}
          mode={mode}
        />
      )}
      <ContinueLearningButton
        variant={hasUpgradeAndConfirm ? 'primary' : undefined}
        linkToCourse={coursewareOrUpgradeLink}
        title={title}
        courseRunId={courseRunId}
        mode={mode}
        startDate={startDate}
        resumeCourseRunUrl={resumeCourseRunUrl}
      />
    </Stack>
  );

  const renderCourseInfoOutline = () => {
    if (!shouldShowUpgradeButton || enterpriseCustomer.hideCourseOriginalPrice || !courseRunPrice) {
      return null;
    }
    return (
      <Stack className="small my-2.5">
        {!enterpriseCustomer.hideCourseOriginalPrice && (
          <div>
            <span>
              <b>{intl.formatMessage(messages.upgradeCourseOriginalPrice)}</b>&nbsp;
              <s>${intl.formatMessage(messages.upgradeCoursePriceStrikethrough, { courseRunPrice })}</s>&nbsp;
              <span className="text-brand font-weight-bold">
                {intl.formatMessage(messages.upgradeCourseFree)}
              </span>
            </span>
          </div>
        )}
        <div className="x-small">{intl.formatMessage(messages.upgradeCourseCoveredByOrganization)}</div>
      </Stack>
    );
  };
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
            { course_run_id: courseRunId },
          );
        },
        children: (
          <div role="menuitem">
            <FormattedMessage
              {...messages.saveCourseForLater}
              values={{
                s: getScreenReaderText,
                courseTitle: title,
              }}
            />
          </div>
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
      { course_run_id: courseRunId },
    );
  };

  const handleMarkCompleteModalOnSuccess = ({ response, resetModalState }) => {
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.course.mark_complete.saved',
      { course_run_id: courseRunId },
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
      type={COURSE_STATUSES.inProgress}
      buttons={renderButtons()}
      dropdownMenuItems={getDropdownMenuItems()}
      title={title}
      linkToCourse={coursewareOrUpgradeLink}
      courseRunId={courseRunId}
      mode={mode}
      startDate={startDate}
      courseInfoOutline={renderCourseInfoOutline()}
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
};

InProgressCourseCard.defaultProps = {
  startDate: null,
  mode: null,
  resumeCourseRunUrl: null,
};

export default InProgressCourseCard;
