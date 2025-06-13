import { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
import { EXECUTIVE_EDUCATION_COURSE_MODES, LICENSE_SUBSIDY_TYPE, useEnterpriseCustomer } from '../../../../app/data';
import { useCourseUpgradeData, useUpdateCourseEnrollmentStatus } from '../data';
import { COURSE_STATUSES } from '../../../../../constants';
import CourseEnrollmentsContext from '../CourseEnrollmentsContext';

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

export const BaseInProgressCourseCard = ({
  renderButtons,
  renderCourseUpgradePrice,
  linkToCourse,
  courseRunId,
  title,
  notifications,
  courseRunStatus,
  startDate = null,
  enrollBy = null,
  mode = null,
  ...rest
}) => {
  const { courseCards } = useContext(AppContext);
  const [isMarkCompleteModalOpen, setIsMarkCompleteModalOpen] = useState(false);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const updateCourseEnrollmentStatus = useUpdateCourseEnrollmentStatus();
  const { addCourseEnrollmentStatusChangeAlert } = useContext(CourseEnrollmentsContext);

  const filteredNotifications = notifications.filter(notification => dayjs(notification.date).isBetween(dayjs(), dayjs().add(1, 'week')));

  const getDropdownMenuItems = () => {
    const cardConfig = courseCards?.['in-progress'];
    const hasMarkComplete = cardConfig?.settingsMenu?.hasMarkComplete;

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
              values={{ s: getScreenReaderText, courseTitle: title }}
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
    });
    addCourseEnrollmentStatusChangeAlert(COURSE_STATUSES.savedForLater);
    global.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <BaseCourseCard
      type={COURSE_STATUSES.inProgress}
      buttons={renderButtons()}
      dropdownMenuItems={getDropdownMenuItems()}
      title={title}
      linkToCourse={linkToCourse}
      courseRunId={courseRunId}
      mode={mode}
      startDate={startDate}
      enrollBy={enrollBy}
      courseUpgradePrice={renderCourseUpgradePrice?.()}
      {...rest}
    >
      {filteredNotifications.length > 0 && (
        <div className="notifications">
          <ul className="list-unstyled mb-0" aria-label="course due dates">
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
      )}
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

const InProgressCourseCard = (props) => {
  const {
    linkToCourse,
    courseRunId,
    title,
    startDate,
    resumeCourseRunUrl,
    mode,
  } = props;

  const renderButtons = () => (
    <Stack direction="horizontal" gap={1}>
      <ContinueLearningButton
        linkToCourse={linkToCourse}
        title={title}
        courseRunId={courseRunId}
        mode={mode}
        startDate={startDate}
        resumeCourseRunUrl={resumeCourseRunUrl}
      />
    </Stack>
  );

  return (
    <BaseInProgressCourseCard
      {...props}
      renderButtons={renderButtons}
    />
  );
};

export const UpgradeableInProgressCourseCard = (props) => {
  const {
    linkToCourse,
    courseRunId,
    title,
    enrollBy,
    startDate,
    resumeCourseRunUrl,
    mode,
  } = props;

  const intl = useIntl();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  const {
    subsidyForCourse,
    hasUpgradeAndConfirm,
    courseRunPrice,
    isPending,
  } = useCourseUpgradeData({
    courseRunKey: courseRunId,
    enrollBy,
    mode,
  });

  const [pending, setPending] = useState(isPending);

  const isExecutiveEducation = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);

  const coursewareOrUpgradeLink = subsidyForCourse?.subsidyType === LICENSE_SUBSIDY_TYPE
    ? subsidyForCourse.redemptionUrl
    : linkToCourse;

  const renderButtons = () => (
    <Stack direction="horizontal" gap={1}>
      {hasUpgradeAndConfirm && (
        <UpgradeCourseButton
          variant={isExecutiveEducation ? 'inverse-brand' : 'brand'}
          title={title}
          courseRunKey={courseRunId}
          mode={mode}
          enrollBy={enrollBy}
        />
      )}
      <ContinueLearningButton
        variant={hasUpgradeAndConfirm ? 'outline-primary' : undefined}
        linkToCourse={coursewareOrUpgradeLink}
        title={title}
        courseRunId={courseRunId}
        mode={mode}
        startDate={startDate}
        resumeCourseRunUrl={resumeCourseRunUrl}
      />
    </Stack>
  );

  const renderCourseUpgradePrice = () => {
    if (!hasUpgradeAndConfirm || enterpriseCustomer.hideCourseOriginalPrice || !courseRunPrice) {
      return null;
    }

    return (
      <Stack className="small">
        <div>
          <b>{intl.formatMessage(messages.upgradeCourseOriginalPrice)}</b>{' '}
          <s>${intl.formatMessage(messages.upgradeCoursePriceStrikethrough, { courseRunPrice })}</s>{' '}
          <span className="text-brand font-weight-bold text-uppercase">
            {intl.formatMessage(messages.upgradeCourseFree)}
          </span>
        </div>
        <div className="x-small">
          {intl.formatMessage(messages.upgradeCourseCoveredByOrganization)}
        </div>
      </Stack>
    );
  };

  useEffect(() => {
    if (!isPending) {
      setPending(false);
    }
  }, [isPending]);

  return (
    <BaseInProgressCourseCard
      {...props}
      linkToCourse={coursewareOrUpgradeLink}
      renderButtons={renderButtons}
      renderCourseUpgradePrice={renderCourseUpgradePrice}
      isLoading={pending}
    />
  );
};

BaseInProgressCourseCard.propTypes = {
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
  enrollBy: PropTypes.string,
  mode: PropTypes.string,
  resumeCourseRunUrl: PropTypes.string,
  renderButtons: PropTypes.func.isRequired,
  renderCourseUpgradePrice: PropTypes.func,
};
BaseInProgressCourseCard.defaultProps = {
  startDate: null,
  enrollBy: null,
  mode: null,
  resumeCourseRunUrl: null,
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
  enrollBy: PropTypes.string,
  mode: PropTypes.string,
  resumeCourseRunUrl: PropTypes.string,
};
InProgressCourseCard.defaultProps = {
  startDate: null,
  enrollBy: null,
  mode: null,
  resumeCourseRunUrl: null,
};

UpgradeableInProgressCourseCard.propTypes = {
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
  enrollBy: PropTypes.string,
  mode: PropTypes.string,
  resumeCourseRunUrl: PropTypes.string,
};
UpgradeableInProgressCourseCard.defaultProps = {
  startDate: null,
  enrollBy: null,
  mode: null,
  resumeCourseRunUrl: null,
};

export default InProgressCourseCard;
