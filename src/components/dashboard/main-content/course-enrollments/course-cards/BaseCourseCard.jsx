import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown, Badge, IconButton, Icon, Skeleton, OverlayTrigger, Tooltip, Row, Col,
} from '@edx/paragon';
import classNames from 'classnames';
import camelCase from 'lodash.camelcase';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { MoreVert, InfoOutline } from '@edx/paragon/icons';

import dayjs from '../../../../../utils/dayjs';
import { EmailSettingsModal } from './email-settings';
import { UnenrollModal } from './unenroll';
import { COURSE_STATUSES, COURSE_PACING, EXECUTIVE_EDUCATION_COURSE_MODES } from '../../../../../constants';

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

class BaseCourseCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modals: {
        emailSettings: {
          open: false,
          options: {},
        },
        unenroll: {
          open: false,
          options: {},
        },
      },
      hasEmailsEnabled: this.props.hasEmailsEnabled,
    };
  }

  getDropdownMenuItems = () => {
    const {
      hasEmailsEnabled, title, dropdownMenuItems, canUnenroll, mode,
    } = this.props;
    const firstMenuItems = [];
    const lastMenuItems = [];
    const isExecutiveEducation2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);
    if (hasEmailsEnabled !== null && !isExecutiveEducation2UCourse) {
      firstMenuItems.push({
        key: 'email-settings',
        type: 'button',
        onClick: this.handleEmailSettingsButtonClick,
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
        onClick: this.handleUnenrollButtonClick,
        children: (
          <div role="menuitem">
            Unenroll
            <span className="sr-only">from {title}</span>
          </div>
        ),
      });
    }
    if (dropdownMenuItems) {
      return [...firstMenuItems, ...dropdownMenuItems, ...lastMenuItems];
    }
    return [...firstMenuItems, ...lastMenuItems];
  };

  getCourseMiscText = () => {
    const { pacing } = this.props;
    const isCourseEnded = this.isCourseEnded();
    let message = '';
    if (pacing) {
      message += 'This course ';
      message += isCourseEnded ? 'was ' : 'is ';
      message += `${pacing}-paced. `;
    }

    return message;
  };

  setModalState = ({ key, open = false, options = {} }) => {
    this.setState(state => ({
      modals: {
        ...state.modals,
        [key]: {
          open,
          options,
        },
      },
    }));
  };

  isCourseEnded = () => {
    const { endDate } = this.props;
    return dayjs(endDate) < dayjs();
  };

  handleEmailSettingsButtonClick = () => {
    const { courseRunId } = this.props;
    const {
      hasEmailsEnabled,
    } = this.state;
    const { enterpriseConfig } = this.context;
    this.setModalState({
      key: 'emailSettings',
      open: true,
      options: {
        hasEmailsEnabled,
      },
    });
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.email_settings_modal.opened',
      { course_run_id: courseRunId },
    );
  };

  handleEmailSettingsModalOnClose = (hasEmailsEnabled) => {
    this.resetModals();
    if (hasEmailsEnabled !== undefined) {
      this.setState({
        hasEmailsEnabled,
      });
    }
  };

  resetModals = () => {
    this.setModalState({ key: 'emailSettings' });
    this.setModalState({ key: 'unenroll' });
  };

  handleUnenrollButtonClick = () => {
    const { courseRunId } = this.props;
    const { enterpriseConfig } = this.context;
    this.setModalState({
      key: 'unenroll',
      open: true,
    });
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.enrollments.course.unenroll_modal.opened',
      { course_run_id: courseRunId },
    );
  };

  renderUnenrollModal = () => {
    const {
      canUnenroll, courseRunId, type,
    } = this.props;
    const { modals } = this.state;

    if (!canUnenroll) {
      return null;
    }

    return (
      <UnenrollModal
        courseRunId={courseRunId}
        onClose={this.handleUnenrollModalOnClose}
        onSuccess={this.handleUnenrollModalOnSuccess}
        isOpen={modals.unenroll.open}
        enrollmentType={camelCase(type)}
      />
    );
  };

  handleUnenrollModalOnClose = () => {
    this.resetModals();
    const { courseRunId } = this.props;
    const { enterpriseConfig } = this.context;
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.enrollments.course.unenroll_modal.closed',
      { course_run_id: courseRunId },
    );
  };

  handleUnenrollModalOnSuccess = () => {
    this.resetModals();
    const { courseRunId } = this.props;
    const { enterpriseConfig } = this.context;
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.enrollments.course.unenroll_modal.unenrolled',
      { course_run_id: courseRunId },
    );
  };

  renderSettingsDropdown = (menuItems) => {
    const { title, mode } = this.props;
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
                  role="menuitem"
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

  renderEmailSettingsModal = () => {
    const { hasEmailsEnabled, courseRunId } = this.props;
    const { modals } = this.state;
    if (hasEmailsEnabled !== null) {
      return (
        <EmailSettingsModal
          {...modals.emailSettings.options}
          courseRunId={courseRunId}
          onClose={this.handleEmailSettingsModalOnClose}
          open={modals.emailSettings.open}
        />
      );
    }
    return null;
  };

  renderAdditionalInfoOutline = () => {
    const { type } = this.props;

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

  renderMicroMastersTitle = () => {
    const { microMastersTitle } = this.props;
    if (microMastersTitle) {
      return (
        <p className="font-weight-bold w-75 mb-2">
          {microMastersTitle}
        </p>
      );
    }
    return null;
  };

  renderOrganizationName = () => {
    const { orgName, mode } = this.props;

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

  renderStartDate = () => {
    const { startDate } = this.props;
    const formattedStartDate = startDate ? dayjs(startDate).format('MMMM Do, YYYY') : null;
    const isCourseStarted = dayjs(startDate) <= dayjs();

    if (formattedStartDate && !isCourseStarted) {
      return <span className="font-weight-light pr-2">Starts {formattedStartDate}</span>;
    }
    return null;
  };

  renderEndDate = () => {
    const { endDate, type } = this.props;
    const formattedEndDate = endDate ? dayjs(endDate).format('MMMM Do, YYYY') : null;
    const isCourseStarted = dayjs(this.props.startDate) <= dayjs();

    if (formattedEndDate && isCourseStarted && type !== COURSE_STATUSES.completed) {
      return <span className="font-weight-light pr-2">Ends {formattedEndDate}</span>;
    }
    return null;
  };

  renderEnrollByDate = () => {
    const { enrollBy, courseRunStatus } = this.props;
    const formattedEnrollByDate = enrollBy ? dayjs(enrollBy).format('MMMM Do, YYYY') : null;

    if (formattedEnrollByDate && courseRunStatus === COURSE_STATUSES.assigned) {
      return <>&bull;<span className="font-weight-light pl-2">Enroll by {formattedEnrollByDate}</span></>;
    }
    return null;
  };

  renderCourseInfoOutline = () => {
    const startDate = this.renderStartDate();
    const endDate = this.renderEndDate();
    const enrollByDate = this.renderEnrollByDate();

    if (!startDate && !endDate && !enrollByDate) {
      return null;
    }

    return (
      <p className="mt-2 mb-4 small">
        {startDate}
        {endDate}
        {enrollByDate}
      </p>
    );
  };

  renderChildren = () => {
    const { children } = this.props;
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

  renderButtons = () => {
    const { buttons } = this.props;
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

  renderViewCertificateText = () => {
    const { linkToCertificate } = this.props;
    const user = getAuthenticatedUser();
    const { username } = user;
    const config = getConfig();

    if (linkToCertificate) {
      return (
        <small className="mt-2 mb-0">
          View your certificate on
          {' '}
          <a href={`${config.LMS_BASE_URL}/u/${username}`}>your profile →</a>
        </small>
      );
    }
    return null;
  };

  renderMiscText = () => {
    const { miscText } = this.props;
    const courseMiscText = this.getCourseMiscText();

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

  renderBadge = () => {
    const { isCourseAssigned, type } = this.props;

    const badgeProps = isCourseAssigned
      ? BADGE_PROPS_BY_COURSE_STATUS.assigned
      : BADGE_PROPS_BY_COURSE_STATUS[type];

    if (badgeProps) {
      return <Badge className="mt-1" {...badgeProps} />;
    }

    return null;
  };

  render() {
    const {
      title,
      linkToCourse,
      hasViewCertificateLink,
      isLoading,
      mode,
    } = this.props;
    const dropdownMenuItems = this.getDropdownMenuItems();
    const isExecutiveEducation2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);

    return (
      <div className={classNames('dashboard-course-card py-3 border-bottom', { 'exec-ed-course-card rounded-lg p-3 text-light-100': isExecutiveEducation2UCourse })}>
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
                  {this.renderMicroMastersTitle()}
                  <div className="d-flex align-items-start justify-content-between mb-1">
                    <h4 className="course-title mb-0 mr-2">
                      <a className={`h3 ${isExecutiveEducation2UCourse && 'text-white'}`} href={linkToCourse}>{title}</a>
                    </h4>
                    {this.renderBadge()}
                  </div>
                  {this.renderOrganizationName()}
                </div>
                {this.renderSettingsDropdown(dropdownMenuItems)}
              </div>
              {this.renderCourseInfoOutline()}
              {this.renderButtons()}
              {this.renderChildren()}
              <Row className="course-misc-text">
                <Col className={`${isExecutiveEducation2UCourse ? 'text-light-300' : 'text-gray'}`}>
                  {this.renderMiscText()}
                  {this.renderAdditionalInfoOutline()}
                  {hasViewCertificateLink && this.renderViewCertificateText()}
                </Col>
              </Row>
              {this.renderEmailSettingsModal()}
              {this.renderUnenrollModal()}
            </>
          )}
      </div>
    );
  }
}

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
};

BaseCourseCard.contextType = AppContext;

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
};

export default BaseCourseCard;
