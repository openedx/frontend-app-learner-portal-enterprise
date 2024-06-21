import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Badge, Col, Dropdown, Icon, IconButton, OverlayTrigger, Row, Skeleton, Tooltip,
} from '@openedx/paragon';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { Info, InfoOutline, MoreVert } from '@openedx/paragon/icons';

import dayjs from '../../../../../utils/dayjs';
import { EmailSettingsModal } from './email-settings';
import { UnenrollModal } from './unenroll';
import { COURSE_PACING, COURSE_STATUSES } from '../../../../../constants';
import { EXECUTIVE_EDUCATION_COURSE_MODES, useEnterpriseCustomer } from '../../../../app/data';

const BADGE_PROPS_BY_COURSE_STATUS = {
  [COURSE_STATUSES.inProgress]: {
    variant: 'success',
    children: 'In Progress',
  },
  [COURSE_STATUSES.upcoming]: {
    variant: 'primary',
    children: 'Upcoming',
  },
  [COURSE_STATUSES.requested]: {
    variant: 'secondary',
    children: 'Requested',
  },
  [COURSE_STATUSES.assigned]: {
    variant: 'info',
    children: 'Assigned',
  },
};

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
  courseRunStatus,
  children,
  buttons,
  linkToCourse,
  linkToCertificate,
  miscText,
  isCourseAssigned,
  isCanceledAssignment,
  isExpiredAssignment,
  isLoading,
  hasViewCertificateLink,
}) => {
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
            Email settings
            <span className="sr-only">for {title}</span>
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
            Unenroll
            <span className="sr-only">from {title}</span>
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
    const execEdClass = isExecutiveEducation2UCourse ? 'text-light-100' : '';
    if (menuItems && menuItems.length > 0) {
      return (
        <div className="ml-auto">
          <Dropdown>
            <Dropdown.Toggle
              as={IconButton}
              src={MoreVert}
              iconAs={Icon}
              alt={`course settings for ${title}`}
              id="course-enrollment-card-settings-dropdown-toggle"
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
    }
    return null;
  };

  const renderEmailSettingsModal = () => {
    if (hasEmailsEnabled !== null) {
      return (
        <EmailSettingsModal
          {...emailSettingsModal.options}
          courseRunId={courseRunId}
          onClose={handleEmailSettingsModalOnClose}
          open={emailSettingsModal.open}
        />
      );
    }
    return null;
  };

  const renderAdditionalInfoOutline = () => {
    if (type === COURSE_STATUSES.requested) {
      return (
        <small className="mt-2">
          Please allow 5-10 business days for review.
          If approved, you will receive an email to get started.
        </small>
      );
    }
    return null;
  };

  const renderMicroMastersTitle = () => {
    if (microMastersTitle) {
      return (
        <p className="font-weight-bold w-75 mb-2">
          {microMastersTitle}
        </p>
      );
    }
    return null;
  };

  const renderOrganizationName = () => {
    const isExecutiveEducation2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);
    const courseTypeLabel = isExecutiveEducation2UCourse ? 'Executive Education' : 'Course';
    const tooltipText = isExecutiveEducation2UCourse
      ? 'Executive Education courses are instructor-led, cohort-based, and follow a set schedule.'
      : 'Courses are on-demand, self-paced, and include asynchronous online discussion.';

    if (orgName) {
      return (
        <p className={classNames('mb-2 font-weight-light d-flex align-items-center small', { 'text-light-300': isExecutiveEducation2UCourse })}>
          {orgName} &bull; {courseTypeLabel}
          <OverlayTrigger
            trigger={['hover', 'focus']}
            placement="top"
            overlay={(
              <Tooltip variant="light" id={`tooltip-${Math.random()}`}>
                {tooltipText}
              </Tooltip>
            )}
          >
            <Icon src={InfoOutline} size="xs" className="ml-2" />
          </OverlayTrigger>
        </p>
      );
    }
    return null;
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
    const formattedEnrollByDate = enrollBy ? dayjs(enrollBy).format('MMMM Do, YYYY') : null;

    if (formattedEnrollByDate && courseRunStatus === COURSE_STATUSES.assigned) {
      return <span className="font-weight-light">Enroll by {formattedEnrollByDate}</span>;
    }
    return null;
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
      <p className="mt-2 mb-4 small">
        {dateFields.map((dateField, index) => {
          const isLastDateField = index === dateFields.length - 1;
          return (
            <span key={uuidv4()}>
              {dateField}
              {!isLastDateField && <span className="px-2">&bull;</span>}
            </span>
          );
        })}
      </p>
    );
  };

  const renderChildren = () => {
    if (children) {
      return (
        <div className="row">
          <div className="col">
            {children}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderButtons = () => {
    if (buttons) {
      return (
        <div className="row">
          <div className="col mt-2">
            {buttons}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderViewCertificateText = () => {
    if (linkToCertificate) {
      return (
        <small className="mt-2 mb-0">
          View your certificate on
          {' '}
          <a href={`${config.LMS_BASE_URL}/u/${authenticatedUser.username}`}>your profile →</a>
        </small>
      );
    }
    return null;
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
    const badgeProps = (isCourseAssigned)
      ? BADGE_PROPS_BY_COURSE_STATUS.assigned
      : BADGE_PROPS_BY_COURSE_STATUS[type];
    if (badgeProps) {
      return <Badge className="mt-1" {...badgeProps} />;
    }
    return null;
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
                <div className="d-flex align-items-start justify-content-between mb-1">
                  <h4 className="course-title mb-0 mr-2">
                    <a className={`h3 ${isExecutiveEducation2UCourse && 'text-white'}`} href={linkToCourse}>{title}</a>
                  </h4>
                  {renderBadge()}
                </div>
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
            { (isCanceledAssignment || isExpiredAssignment) && (
              <Row className={classNames({ 'mt-4 assignment-alert-row': isExecutiveEducation2UCourse }, { 'mt-2 pl-2': !isExecutiveEducation2UCourse })}>
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
  courseRunStatus: PropTypes.string,
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
  courseRunStatus: null,
  isCourseAssigned: false,
  isCanceledAssignment: false,
  isExpiredAssignment: false,
};

export default BaseCourseCard;
