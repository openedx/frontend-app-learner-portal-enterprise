import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Badge, Col, Dropdown, Icon, IconButton, IconButtonWithTooltip, Row, Skeleton, Hyperlink, Stack,
} from '@openedx/paragon';
import {
  Info,
  InfoOutline,
  MoreVert,
  Warning,
} from '@openedx/paragon/icons';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';
import { FormattedMessage, defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import dayjs from '../../../../../utils/dayjs';
import { EmailSettingsModal } from './email-settings';
import { UnenrollModal } from './unenroll';
import { COURSE_PACING, COURSE_STATUSES, EXECUTIVE_EDUCATION_COURSE_MODES } from '../../../../../constants';
import { ENROLL_BY_DATE_WARNING_THRESHOLD_DAYS, useEnterpriseCustomer } from '../../../../app/data';
import { isTodayWithinDateThreshold } from '../../../../../utils/common';

const messages = defineMessages({
  statusBadgeLabelInProgress: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.status_badge_label.in_progress',
    defaultMessage: 'In Progress',
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
  hasEmailsEnabled: defaultHasEmailsEnabled,
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
  buttons,
  linkToCourse,
  externalCourseLink,
  linkToCertificate,
  miscText,
  isCourseAssigned,
  isCanceledAssignment,
  isExpiredAssignment,
  isLoading,
  hasViewCertificateLink,
}) => {
  const intl = useIntl();
  const { config, authenticatedUser } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const [hasEmailsEnabled, setHasEmailsEnabled] = useState(defaultHasEmailsEnabled);
  const [emailSettingsModal, setEmailSettingsModal] = useState({
    open: false,
    options: {},
  });
  const [unenrollModal, setUnenrollModal] = useState({
    open: false,
    options: {},
  });

  const CourseTitleComponent = externalCourseLink ? Hyperlink : Link;

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
    const isExecutiveEducation2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);
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
    const isCourseEnded = dayjs(endDate).isAfter();
    let message = '';
    if (pacing) {
      message += 'This course ';
      message += isCourseEnded ? 'was ' : 'is ';
      message += `${pacing}-paced. `;
    }
    return message;
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

  const handleEmailSettingsModalOnClose = (newValue) => {
    resetModals();
    if (hasEmailsEnabled !== undefined) {
      setHasEmailsEnabled(newValue);
    }
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
    const isExecutiveEducation2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);
    const execEdClass = isExecutiveEducation2UCourse ? 'text-light-100' : undefined;

    if (!menuItems?.length) {
      return null;
    }

    return (
      <div className="ml-auto">
        <Dropdown>
          <Dropdown.Toggle
            as={IconButton}
            src={MoreVert}
            iconAs={Icon}
            alt={`course settings for ${title}`}
            id={`course-enrollment-card-settings-dropdown-toggle-${courseRunId}`}
            iconClassNames={execEdClass}
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
    if (!hasEmailsEnabled) {
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
      <small className="mt-2">
        <FormattedMessage {...messages.requestedCourseHelpText} />
      </small>
    );
  };

  const renderMicroMastersTitle = () => {
    if (!microMastersTitle) {
      return null;
    }
    return (
      <p className="font-weight-bold w-75 mb-2">
        {microMastersTitle}
      </p>
    );
  };

  const renderOrganizationName = () => {
    if (!orgName) {
      return null;
    }
    const isExecutiveEducation2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);
    const courseTypeLabel = isExecutiveEducation2UCourse ? 'Executive Education' : 'Course';
    const tooltipText = isExecutiveEducation2UCourse
      ? 'Executive Education courses are instructor-led, cohort-based, and follow a set schedule.'
      : 'Courses are on-demand, self-paced, and include asynchronous online discussion.';

    return (
      <Stack direction="horizontal" gap={1} className="align-items-center font-weight-light small mb-2">
        <p className={classNames('mb-0', { 'text-light-300': isExecutiveEducation2UCourse })}>
          {orgName} &bull; {courseTypeLabel}
        </p>
        <IconButtonWithTooltip
          placement="top"
          tooltipContent={tooltipText}
          iconAs={Icon}
          src={InfoOutline}
          size="inline"
          alt="More information about course type"
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
      <div className="mt-2 mb-4 small">
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

  const renderChildren = () => {
    if (children) {
      return (
        <Row>
          <Col>
            {children}
          </Col>
        </Row>
      );
    }
    return null;
  };

  const renderButtons = () => {
    if (!buttons) {
      return null;
    }
    return (
      <Row>
        <Col className="mt-2">
          {buttons}
        </Col>
      </Row>
    );
  };

  const renderViewCertificateText = () => {
    if (!linkToCertificate) {
      return null;
    }
    return (
      <small className="mt-2 mb-0">
        View your certificate on
        {' '}
        <a href={`${config.LMS_BASE_URL}/u/${authenticatedUser.username}`}>your profile →</a>
      </small>
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
      <small className="mb-0 mt-2">
        {courseMiscText}
      </small>
    );
  };

  const renderBadge = () => {
    const badgeProps = (isCourseAssigned) ? BADGE_PROPS_BY_COURSE_STATUS.assigned : BADGE_PROPS_BY_COURSE_STATUS[type];
    if (!badgeProps) {
      return null;
    }
    return <Badge className="mt-1" {...badgeProps} />;
  };

  const renderAssignmentAlert = () => {
    const alertText = isCanceledAssignment ? 'Your learning administrator canceled this assignment' : 'Deadline to enroll in this course has passed';
    const isExecutiveEducation2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);
    return (
      <div className={classNames('p-2 small d-flex align-items-center', { 'assignment-alert bg-light-300': isExecutiveEducation2UCourse })}>
        <Icon src={Info} size="sm" className="text-dark mr-2" />
        <span className="text-dark font-weight-normal">{alertText}</span>
      </div>
    );
  };

  const dropdownMenuItems = getDropdownMenuItems();
  const isExecutiveEducation2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);

  return (
    <div className={classNames(
      'dashboard-course-card py-3 border-bottom mb-2',
      { 'exec-ed-course-card rounded-lg p-3 text-light-100': isExecutiveEducation2UCourse },
      { 'mb-3': (isCanceledAssignment || isExpiredAssignment) },
    )}
    >
      {isLoading ? (
        <>
          <div className="sr-only">Loading...</div>
          <Skeleton height={50} />
        </>
      )
        : (
          <>
            <div className="d-flex">
              <div className="flex-grow-1 mr-4 mb-3">
                {renderMicroMastersTitle()}
                <Stack gap={2} direction="horizontal" className="align-items-start justify-content-between mb-1">
                  <h4 className="course-title mb-0">
                    <CourseTitleComponent
                      className={classNames('h3', { 'text-white': isExecutiveEducation2UCourse })}
                      destination={externalCourseLink ? linkToCourse : null}
                      to={!externalCourseLink ? linkToCourse : null}
                    >
                      {title}
                    </CourseTitleComponent>
                  </h4>
                  {renderBadge()}
                </Stack>
                {renderOrganizationName()}
              </div>
              {renderSettingsDropdown(dropdownMenuItems)}
            </div>
            {renderCourseInfoOutline()}
            {renderButtons()}
            {renderChildren()}
            <Row className="course-misc-text">
              <Col className={`${isExecutiveEducation2UCourse ? 'text-light-300' : 'text-gray'}`}>
                {renderMiscText()}
                {renderAdditionalInfoOutline()}
                {hasViewCertificateLink && renderViewCertificateText()}
              </Col>
            </Row>
            {(isCanceledAssignment || isExpiredAssignment) && (
              <Row
                className={classNames({
                  'mt-4 assignment-alert-row': isExecutiveEducation2UCourse,
                  'mt-2 pl-2': !isExecutiveEducation2UCourse,
                })}
              >
                {renderAssignmentAlert()}
              </Row>
            )}
            {renderEmailSettingsModal()}
            {renderUnenrollModal()}
          </>
        )}
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
  hasViewCertificateLink: PropTypes.bool,
  buttons: PropTypes.element,
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
  linkToCertificate: null,
  hasViewCertificateLink: true,
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
