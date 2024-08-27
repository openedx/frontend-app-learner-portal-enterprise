import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import {
  Badge,
  Col,
  Dropdown,
  Hyperlink,
  Icon,
  IconButton,
  IconButtonWithTooltip,
  Row,
  Skeleton,
  Stack,
} from '@openedx/paragon';
import {
  Info, InfoOutline, MoreVert, Warning,
} from '@openedx/paragon/icons';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';
import { defineMessages, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { getConfig } from '@edx/frontend-platform';
import dayjs from '../../../../../utils/dayjs';
import { EmailSettingsModal } from './email-settings';
import { UnenrollModal } from './unenroll';
import { COURSE_PACING, COURSE_STATUSES } from '../../../../../constants';
import {
  ENROLL_BY_DATE_WARNING_THRESHOLD_DAYS,
  EXECUTIVE_EDUCATION_COURSE_MODES,
  useEnterpriseCustomer,
} from '../../../../app/data';
import { isCourseEnded, isDefinedAndNotNull, isTodayWithinDateThreshold } from '../../../../../utils/common';

const messages = defineMessages({
  statusBadgeLabelInProgress: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.status_badge_label.in_progress',
    defaultMessage: 'In progress',
    description: 'The label for the status badge for courses that are in-progress',
  },
  statusBadgeLabelUpcoming: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.status_badge_label.upcoming',
    defaultMessage: 'Upcoming',
    description: 'The label for the status badge for courses that are upcoming',
  },
  statusBadgeLabelRequested: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.status_badge_label.requested',
    defaultMessage: 'Requested',
    description: 'The label for the status badge for courses that are requested',
  },
  statusBadgeLabelAssigned: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.status_badge_label.assigned',
    defaultMessage: 'Assigned',
    description: 'The label for the status badge for courses that are assigned',
  },
  emailSettings: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.email_settings',
    defaultMessage: 'Email settings <s>for {courseTitle}</s>',
    description: 'The label for the email settings option in the course card dropdown',
  },
  unenroll: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.unenroll',
    defaultMessage: 'Unenroll <s>from {courseTitle}</s>',
    description: 'The label for the unenroll option in the course card dropdown',
  },
  requestedCourseHelpText: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.requested.help_text',
    defaultMessage: 'Please allow 5-10 business days for review. If approved, you will receive an email to get started.',
    description: 'Help text for requested courses',
  },
  enrollByDateWarning: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.enroll_by_date_warning',
    defaultMessage: 'Enroll by {enrollByDate}',
    description: 'Warning message for enrollment deadline approaching',
  },
  enrollByDateWarningTooltipAlt: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.enroll_by_date_warning.tooltip_alt',
    defaultMessage: 'Learn more about enrollment deadline for {courseTitle}',
    description: 'Tooltip alt text for enrollment deadline approaching',
  },
  enrollByDateWarningTooltipContent: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.enroll_by_date_warning.tooltip_content',
    defaultMessage: 'Enrollment deadline approaching',
    description: 'Tooltip content for enrollment deadline approaching',
  },
  pacingWas: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.misc_text.pacing_was',
    defaultMessage: 'This course was <a>{pacing}-paced</a>',
    description: 'The label for the course miscellaneous past tense text for course mode pacing',
  },
  pacingIs: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.misc_text.pacing_is',
    defaultMessage: 'This course is <a>{pacing}-paced</a>',
    description: 'The label for the course miscellaneous current tense text for course mode pacing',
  },
});

const BADGE_PROPS_BY_COURSE_STATUS = {
  [COURSE_STATUSES.inProgress]: {
    variant: 'success',
    children: <FormattedMessage {...messages.statusBadgeLabelInProgress} />,
  },
  [COURSE_STATUSES.upcoming]: {
    variant: 'primary',
    children: <FormattedMessage {...messages.statusBadgeLabelUpcoming} />,
  },
  [COURSE_STATUSES.requested]: {
    variant: 'secondary',
    children: <FormattedMessage {...messages.statusBadgeLabelRequested} />,
  },
  [COURSE_STATUSES.assigned]: {
    variant: 'info',
    children: <FormattedMessage {...messages.statusBadgeLabelAssigned} />,
  },
};

export const getScreenReaderText = (str) => (
  <span className="sr-only">{str}</span>
);

const BaseCourseCard = ({
  hasEmailsEnabled,
  title,
  dropdownMenuItems: customDropdownMenuItem,
  canUnenroll,
  mode,
  pacing,
  startDate,
  enrollBy,
  endDate,
  courseRunId,
  type,
  microMastersTitle,
  orgName,
  children,
  courseUpgradePrice,
  buttons,
  linkToCourse,
  externalCourseLink,
  miscText,
  isCourseAssigned,
  isCanceledAssignment,
  isExpiredAssignment,
  isLoading,
}) => {
  const intl = useIntl();
  const { LEARNER_SUPPORT_PACED_COURSE_MODE_URL } = getConfig();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const [emailSettingsModal, setEmailSettingsModal] = useState({
    open: false,
    options: {},
  });
  const [unenrollModal, setUnenrollModal] = useState({
    open: false,
    options: {},
  });

  const isExecutiveEducation2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);

  const CourseTitleComponent = externalCourseLink ? Hyperlink : Link;

  const getCoursePaceHyperlink = (chunks) => (
    <Hyperlink
      className={classNames('text-underline', { 'text-light-200': EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode) })}
      destination={LEARNER_SUPPORT_PACED_COURSE_MODE_URL}
      target="_blank"
      data-testid="course-pacing-help-link"
    >
      {chunks}
    </Hyperlink>
  );

  const handleUnenrollButtonClick = () => {
    setUnenrollModal((prevState) => ({
      ...prevState,
      open: true,
    }));
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.enrollments.course.unenroll_modal.opened',
      { course_run_id: courseRunId },
    );
  };

  const handleEmailSettingsButtonClick = () => {
    setEmailSettingsModal((prevState) => ({
      ...prevState,
      open: true,
      options: {
        hasEmailsEnabled,
      },
    }));
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.email_settings_modal.opened',
      { course_run_id: courseRunId },
    );
  };

  const getDropdownMenuItems = () => {
    const firstMenuItems = [];
    const lastMenuItems = [];
    if (hasEmailsEnabled !== null && !isExecutiveEducation2UCourse) {
      firstMenuItems.push({
        key: 'email-settings',
        type: 'button',
        onClick: handleEmailSettingsButtonClick,
        children: (
          <div role="menuitem">
            <FormattedMessage
              {...messages.emailSettings}
              values={{
                s: getScreenReaderText,
                courseTitle: title,
              }}
            />
          </div>
        ),
      });
    }
    if (canUnenroll) {
      lastMenuItems.push({
        key: 'unenroll',
        type: 'button',
        onClick: handleUnenrollButtonClick,
        children: (
          <div role="menuitem">
            <FormattedMessage
              {...messages.unenroll}
              values={{
                s: getScreenReaderText,
                courseTitle: title,
              }}
            />
          </div>
        ),
      });
    }
    if (customDropdownMenuItem) {
      return [...firstMenuItems, ...customDropdownMenuItem, ...lastMenuItems];
    }
    return [...firstMenuItems, ...lastMenuItems];
  };

  const getCourseMiscText = () => {
    if (!pacing || !COURSE_PACING[pacing.toUpperCase()]) {
      return null;
    }
    const courseHasEnded = isCourseEnded(endDate);
    if (courseHasEnded) {
      return messages.pacingWas;
    }
    return messages.pacingIs;
  };

  const resetModals = () => {
    setEmailSettingsModal((prevState) => ({
      ...prevState,
      open: false,
    }));
    setUnenrollModal((prevState) => ({
      ...prevState,
      open: false,
    }));
  };

  const handleEmailSettingsModalOnClose = () => {
    resetModals();
  };

  const handleUnenrollModalOnClose = () => {
    resetModals();
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.enrollments.course.unenroll_modal.closed',
      { course_run_id: courseRunId },
    );
  };

  const handleUnenrollModalOnSuccess = () => {
    resetModals();
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.enrollments.course.unenroll_modal.unenrolled',
      { course_run_id: courseRunId },
    );
  };

  const renderUnenrollModal = () => {
    if (!canUnenroll) {
      return null;
    }
    return (
      <UnenrollModal
        courseRunId={courseRunId}
        onClose={handleUnenrollModalOnClose}
        onSuccess={handleUnenrollModalOnSuccess}
        isOpen={unenrollModal.open}
      />
    );
  };

  const renderSettingsDropdown = (menuItems) => {
    const execEdClass = isExecutiveEducation2UCourse ? 'text-light-100' : undefined;

    if (!menuItems?.length) {
      return null;
    }

    return (
      <div className="ml-auto mt-n1.5">
        <Dropdown>
          <Dropdown.Toggle
            as={IconButton}
            src={MoreVert}
            iconAs={Icon}
            alt={`course settings for ${title}`}
            id={`course-enrollment-card-settings-dropdown-toggle-${courseRunId}`}
            iconClassNames={execEdClass}
            size="inline"
          />
          <Dropdown.Menu>
            {menuItems.map(menuItem => (
              <Dropdown.Item
                key={menuItem.key}
                as={menuItem.type}
                onClick={menuItem.onClick}
              >
                {menuItem.children}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  };

  const renderEmailSettingsModal = () => {
    if (!isDefinedAndNotNull(hasEmailsEnabled)) {
      return null;
    }
    return (
      <EmailSettingsModal
        {...emailSettingsModal.options}
        courseRunId={courseRunId}
        onClose={handleEmailSettingsModalOnClose}
        open={emailSettingsModal.open}
      />
    );
  };

  const renderAdditionalInfoOutline = () => {
    if (type !== COURSE_STATUSES.requested) {
      return null;
    }
    return (
      <div className="small">
        <FormattedMessage {...messages.requestedCourseHelpText} />
      </div>
    );
  };

  const renderMicroMastersTitle = () => {
    if (!microMastersTitle) {
      return null;
    }
    return (
      <div className="font-weight-bold small mb-1">
        {microMastersTitle}
      </div>
    );
  };

  const renderOrgNameAndCourseType = () => {
    if (!orgName) {
      return null;
    }
    const courseTypeLabel = isExecutiveEducation2UCourse ? 'Executive Education' : 'Course';
    const tooltipText = isExecutiveEducation2UCourse
      ? 'Executive Education courses are instructor-led, cohort-based, and follow a set schedule.'
      : 'Courses are on-demand, self-paced, and include asynchronous online discussion.';

    return (
      <Stack direction="horizontal" gap={1} className="align-items-center font-weight-light small">
        <p className={classNames('mb-0', { 'text-light-200': isExecutiveEducation2UCourse })}>
          {orgName} &bull; {courseTypeLabel}
        </p>
        <IconButtonWithTooltip
          placement="top"
          tooltipContent={tooltipText}
          iconAs={Icon}
          src={InfoOutline}
          size="inline"
          alt="More information about course type"
          invertColors={isExecutiveEducation2UCourse}
        />
      </Stack>
    );
  };

  const renderStartDate = () => {
    const formattedStartDate = startDate ? dayjs(startDate).format('MMMM Do, YYYY') : null;
    const isCourseStarted = dayjs(startDate) <= dayjs();
    if (formattedStartDate && !isCourseStarted) {
      return <span className="font-weight-light">Starts {formattedStartDate}</span>;
    }
    return null;
  };

  const renderEndDate = () => {
    const formattedEndDate = endDate ? dayjs(endDate).format('MMMM Do, YYYY') : null;
    const isCourseStarted = dayjs(startDate).isBefore(dayjs());
    if (formattedEndDate && isCourseStarted && type !== COURSE_STATUSES.completed) {
      return <span className="font-weight-light">Ends {formattedEndDate}</span>;
    }
    return null;
  };

  const renderEnrollByDate = () => {
    if (!enrollBy || type !== COURSE_STATUSES.assigned) {
      return null;
    }
    const isEnrollByExpiringSoon = isTodayWithinDateThreshold({
      days: ENROLL_BY_DATE_WARNING_THRESHOLD_DAYS,
      date: enrollBy,
    });
    const enrollByDate = dayjs(enrollBy);
    const isEnrollByDateMidnight = enrollByDate.hour() === 0 && enrollByDate.minute() === 0;
    const baseFormatStr = 'MMMM Do, YYYY';
    const enrollByDateFormat = isEnrollByDateMidnight ? baseFormatStr : `h:mma ${baseFormatStr}`;
    const formattedEnrollByDate = enrollByDate.format(enrollByDateFormat);
    return (
      <Stack direction="horizontal" gap={1} className="d-inline-flex align-items-center font-weight-light">
        <FormattedMessage {...messages.enrollByDateWarning} values={{ enrollByDate: formattedEnrollByDate }} />
        {isEnrollByExpiringSoon && (
          <IconButtonWithTooltip
            tooltipPlacement="right"
            tooltipContent={intl.formatMessage(messages.enrollByDateWarningTooltipContent)}
            iconAs={Icon}
            src={Warning}
            size="inline"
            variant="warning"
            alt={intl.formatMessage(messages.enrollByDateWarningTooltipAlt, { courseTitle: title })}
          />
        )}
      </Stack>
    );
  };

  const renderCourseInfoOutline = () => {
    const renderedStartDate = renderStartDate();
    const renderedEndDate = renderEndDate();
    const renderedEnrollByDate = renderEnrollByDate();

    if (!renderedStartDate && !renderedEndDate && !renderedEnrollByDate) {
      return null;
    }

    const dateFields = [];
    if (renderedStartDate) {
      dateFields.push(renderedStartDate);
    }
    if (renderedEndDate) {
      dateFields.push(renderedEndDate);
    }
    if (renderedEnrollByDate) {
      dateFields.push(renderedEnrollByDate);
    }

    return (
      <div className="small">
        {dateFields.map((dateField, index) => {
          const isLastDateField = index === dateFields.length - 1;
          return (
            <span key={uuidv4()}>
              {dateField}
              {!isLastDateField && <span className="px-2">&bull;</span>}
            </span>
          );
        })}
      </div>
    );
  };

  const renderCourseUpgradePrice = () => {
    if (courseUpgradePrice) {
      return courseUpgradePrice;
    }
    return null;
  };

  const renderButtons = () => {
    if (!buttons) {
      return null;
    }
    return (
      <Row>
        <Col>
          {buttons}
        </Col>
      </Row>
    );
  };

  const renderMiscText = () => {
    const courseMiscText = getCourseMiscText();
    if (miscText != null) {
      return miscText;
    }
    if (!courseMiscText) {
      return null;
    }

    return (
      <div className="small">
        {intl.formatMessage(courseMiscText, {
          a: getCoursePaceHyperlink,
          pacing,
        })}
      </div>
    );
  };

  const renderBadge = () => {
    const badgeProps = isCourseAssigned ? BADGE_PROPS_BY_COURSE_STATUS.assigned : BADGE_PROPS_BY_COURSE_STATUS[type];
    if (!badgeProps) {
      return null;
    }
    return <Badge {...badgeProps} />;
  };

  const renderAssignmentAlert = () => {
    const alertText = isCanceledAssignment ? 'Your learning administrator canceled this assignment' : 'Deadline to enroll in this course has passed';
    return (
      <Stack
        direction="horizontal"
        gap={1.5}
        className="small align-items-center"
      >
        <Icon src={Info} size="md" />
        <span>{alertText}</span>
      </Stack>
    );
  };

  const dropdownMenuItems = getDropdownMenuItems();

  return (
    <div className={classNames(
      'dashboard-course-card-wrapper border-bottom',
      { 'py-4': !isExecutiveEducation2UCourse },
    )}
    >
      <div className={classNames(
        'dashboard-course-card',
        { 'exec-ed-course-card text-light-200 p-3 my-3 rounded shadow-sm': isExecutiveEducation2UCourse },
      )}
      >
        {isLoading ? (
          <>
            <div className="sr-only">Loading...</div>
            <Skeleton height={200} />
          </>
        )
          : (
            <Stack gap={3}>
              <div className="d-flex">
                <div className="flex-grow-1 mr-4">
                  <Stack
                    gap={2}
                    direction="horizontal"
                    className="align-items-start justify-content-between"
                  >
                    <h4 className="course-title mt-n1 mb-0">
                      {renderMicroMastersTitle()}
                      <CourseTitleComponent
                        className={classNames('h3 mb-0', { 'text-white': isExecutiveEducation2UCourse })}
                        destination={externalCourseLink ? linkToCourse : null}
                        to={!externalCourseLink ? linkToCourse : null}
                      >
                        {title}
                      </CourseTitleComponent>
                    </h4>
                    {renderBadge()}
                  </Stack>
                  {renderOrgNameAndCourseType()}
                </div>
                {renderSettingsDropdown(dropdownMenuItems)}
              </div>
              {renderCourseInfoOutline()}
              {renderCourseUpgradePrice()}
              {renderButtons()}
              {children}
              {!isCourseAssigned && (
                <Row className="course-misc-text">
                  <Col className={classNames({ 'text-light-200': isExecutiveEducation2UCourse })}>
                    {renderMiscText()}
                    {renderAdditionalInfoOutline()}
                  </Col>
                </Row>
              )}
              {(isCanceledAssignment || isExpiredAssignment) && (
                <div
                  className={classNames('text-dark bg-white', {
                    'mx-n3 mb-n3 p-3 rounded-bottom': isExecutiveEducation2UCourse,
                  })}
                >
                  {renderAssignmentAlert()}
                </div>
              )}
            </Stack>
          )}
        {renderEmailSettingsModal()}
        {renderUnenrollModal()}
      </div>
    </div>
  );
};

BaseCourseCard.propTypes = {
  type: PropTypes.oneOf(Object.values(COURSE_STATUSES)).isRequired,
  title: PropTypes.string.isRequired,
  linkToCourse: PropTypes.string.isRequired,
  externalCourseLink: PropTypes.bool,
  courseRunId: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  buttons: PropTypes.element,
  courseUpgradePrice: PropTypes.element,
  children: PropTypes.node,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  hasEmailsEnabled: PropTypes.bool,
  canUnenroll: PropTypes.bool,
  microMastersTitle: PropTypes.string,
  orgName: PropTypes.string,
  pacing: PropTypes.oneOf(Object.values(COURSE_PACING)),
  linkToCertificate: PropTypes.string,
  dropdownMenuItems: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    type: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.element,
  })),
  isLoading: PropTypes.bool,
  miscText: PropTypes.node,
  enrollBy: PropTypes.string,
  isCourseAssigned: PropTypes.bool,
  isCanceledAssignment: PropTypes.bool,
  isExpiredAssignment: PropTypes.bool,
};

BaseCourseCard.defaultProps = {
  children: null,
  startDate: null,
  endDate: null,
  hasEmailsEnabled: null,
  canUnenroll: null,
  microMastersTitle: null,
  orgName: null,
  pacing: null,
  buttons: null,
  courseUpgradePrice: null,
  linkToCertificate: null,
  dropdownMenuItems: null,
  isLoading: false,
  miscText: null,
  enrollBy: null,
  isCourseAssigned: false,
  isCanceledAssignment: false,
  isExpiredAssignment: false,
  externalCourseLink: true,
};

export default BaseCourseCard;
