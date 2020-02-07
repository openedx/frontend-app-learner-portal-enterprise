import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { EmailSettingsModal } from './email-settings';

import './styles/CourseCard.scss';

class BaseCourseCard extends Component {
  state = {
    modals: {
      emailSettings: {
        open: false,
        options: {},
      },
    },
    hasEmailsEnabled: this.props.hasEmailsEnabled,
  };

  getDropdownMenuItems = () => {
    const { hasEmailsEnabled, title, dropdownMenuItems } = this.props;
    let combinedMenuItems = [];
    if (hasEmailsEnabled !== null) {
      combinedMenuItems.push({
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
    if (dropdownMenuItems) {
      combinedMenuItems = [...combinedMenuItems, ...dropdownMenuItems];
    }
    return combinedMenuItems;
  };

  getDateMessage = () => {
    const { type, pacing, endDate } = this.props;
    const formattedEndDate = endDate ? moment(endDate).format('MMMM D, YYYY') : null;
    let message = '';
    if (formattedEndDate) {
      switch (type) {
        case 'in_progress': {
          if (pacing === 'self') {
            message += `Complete at your own speed before ${formattedEndDate}.`;
          } else {
            message += `Ends ${formattedEndDate}.`;
          }
          break;
        }
        case 'upcoming': {
          message += `Ends ${formattedEndDate}.`;
          break;
        }
        case 'completed': {
          message += `Ended ${formattedEndDate}.`;
          break;
        }
        default:
          break;
      }
    }
    return message;
  };

  getCourseMiscText = () => {
    const { pacing } = this.props;
    const isCourseEnded = this.isCourseEnded();
    const dateMessage = this.getDateMessage();
    let message = '';
    if (pacing) {
      message += 'This course ';
      message += isCourseEnded ? 'was ' : 'is ';
      message += `${pacing}-paced. `;
    }
    if (dateMessage) {
      message += dateMessage;
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
    return moment(endDate) < moment();
  };

  handleEmailSettingsButtonClick = () => {
    const {
      title,
      courseRunId,
    } = this.props;

    const {
      hasEmailsEnabled,
    } = this.state;

    this.setModalState({
      key: 'emailSettings',
      open: true,
      options: {
        title,
        hasEmailsEnabled,
      },
    });
    sendTrackEvent('edx.learner_portal.email_settings_modal.opened', { course_run_id: courseRunId });
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
  };

  renderSettingsDropdown = (menuItems) => {
    const { title } = this.props;
    if (menuItems && menuItems.length > 0) {
      return (
        <div className="ml-auto">
          <Dropdown>
            <Dropdown.Button className="btn-outline-secondary">
              <FontAwesomeIcon icon={faCog} />
              <span className="sr-only">
                course settings for {title}
              </span>
            </Dropdown.Button>
            <Dropdown.Menu>
              {menuItems.map(menuItem => (
                <Dropdown.Item
                  key={menuItem.key}
                  type={menuItem.type}
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

  renderSponsoredByEnterpriseMessage = () => {
    const { pageContext: { enterpriseName } } = this.context;
    if (enterpriseName) {
      return <small>Sponsored by {enterpriseName}.</small>;
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
    const { orgName } = this.props;
    if (orgName) {
      return <p className="mb-0">{orgName}</p>;
    }
    return null;
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
          <div className="col mb-3">
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
    if (linkToCertificate) {
      return (
        <small className="mb-0">
          View your certificate on
          {' '}
          <a className="text-underline" href={`${process.env.LMS_BASE_URL}/u/${username}`}>your profile →</a>
        </small>
      );
    }
    return null;
  };

  render() {
    const {
      title,
      microMastersTitle,
      linkToCourse,
      hasViewCertificateLink,
    } = this.props;
    const dropdownMenuItems = this.getDropdownMenuItems();
    return (
      <div
        className={classNames(
          'course py-4 border-bottom',
          { 'is-micromasters': !!microMastersTitle },
        )}
      >
        <div className="d-flex">
          <div className="flex-grow-1 mr-4 mb-3">
            {this.renderMicroMastersTitle()}
            <h3 className="course-title mb-1">
              <a href={linkToCourse}>{title}</a>
            </h3>
            {this.renderOrganizationName()}
          </div>
          {this.renderSettingsDropdown(dropdownMenuItems)}
        </div>
        {this.renderButtons()}
        {this.renderChildren()}
        <div className="course-misc-text row">
          <div className="col text-gray">
            <small className="mb-0">
              {this.getCourseMiscText()}
            </small>
            {this.renderSponsoredByEnterpriseMessage()}
            {hasViewCertificateLink && this.renderViewCertificateText()}
          </div>
        </div>
        {this.renderEmailSettingsModal()}
      </div>
    );
  }
}

BaseCourseCard.propTypes = {
  type: PropTypes.oneOf([
    'in_progress', 'upcoming', 'completed',
  ]).isRequired,
  title: PropTypes.string.isRequired,
  linkToCourse: PropTypes.string.isRequired,
  courseRunId: PropTypes.string.isRequired,
  hasViewCertificateLink: PropTypes.bool,
  buttons: PropTypes.element,
  children: PropTypes.node,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  hasEmailsEnabled: PropTypes.bool,
  microMastersTitle: PropTypes.string,
  orgName: PropTypes.string,
  pacing: PropTypes.oneOf(['instructor', 'self']),
  linkToCertificate: PropTypes.string,
  dropdownMenuItems: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    type: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.element,
  })),
};

BaseCourseCard.contextType = AppContext;

BaseCourseCard.defaultProps = {
  children: null,
  startDate: null,
  endDate: null,
  hasEmailsEnabled: null,
  microMastersTitle: null,
  orgName: null,
  pacing: null,
  buttons: null,
  linkToCertificate: null,
  hasViewCertificateLink: true,
  dropdownMenuItems: null,
};

export default BaseCourseCard;
