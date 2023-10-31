import React from 'react';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { Badge, Collapsible } from '@edx/paragon';

import { AppContext } from '@edx/frontend-platform/react';
import {
  InProgressCourseCard,
  UpcomingCourseCard,
  CompletedCourseCard,
  SavedForLaterCourseCard,
  RequestedCourseCard,
  AssignedCourseCard,
} from './course-cards';

import { UpgradeableCourseEnrollmentContextProvider } from './UpgradeableCourseEnrollmentContextProvider';
import { COURSE_STATUSES, COURSE_MODES } from '../../../../constants';

const CARD_COMPONENT_BY_COURSE_STATUS = {
  [COURSE_STATUSES.upcoming]: UpcomingCourseCard,
  [COURSE_STATUSES.inProgress]: InProgressCourseCard,
  [COURSE_STATUSES.completed]: CompletedCourseCard,
  [COURSE_STATUSES.savedForLater]: SavedForLaterCourseCard,
  [COURSE_STATUSES.requested]: RequestedCourseCard,
  [COURSE_STATUSES.assigned]: AssignedCourseCard,
};

class CourseSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
    };
  }

  getCoursesCount = (isOpen, title, coursesCount) => {
    if (!isOpen) {
      if (title === 'Assigned Courses') {
        return <sup><Badge pill variant="danger">{coursesCount}</Badge></sup>;
      }
      return `(${coursesCount})`;
    }
    return null;
  };

  getFormattedSectionTitle = () => {
    const { isOpen } = this.state;
    const { courseRuns, title } = this.props;
    const sectionTitle = isOpen ? title : `${title} `;
    const coursesCount = this.getCoursesCount(isOpen, title, courseRuns.length);
    return (
      <h3>
        {sectionTitle}
        {coursesCount}
      </h3>
    );
  };

  getFormattedOptionalSubtitle = () => {
    const { subtitle } = this.props;
    if (!subtitle) { return null; }
    return <p className="mt-3 mb-0">{subtitle}</p>;
  };

  getCourseRunProps = ({
    linkToCertificate,
    notifications,
    courseRunStatus,
    isRevoked,
    resumeCourseRunUrl,
    ...rest
  }) => {
    const courseRunProps = { courseRunStatus };
    switch (courseRunStatus) {
      case COURSE_STATUSES.inProgress:
        courseRunProps.linkToCertificate = linkToCertificate;
        courseRunProps.notifications = notifications;
        courseRunProps.resumeCourseRunUrl = resumeCourseRunUrl;
        break;
      case COURSE_STATUSES.savedForLater:
        courseRunProps.isRevoked = isRevoked;
        courseRunProps.resumeCourseRunUrl = resumeCourseRunUrl;
        break;
      case COURSE_STATUSES.completed:
        courseRunProps.linkToCertificate = linkToCertificate;
        courseRunProps.resumeCourseRunUrl = resumeCourseRunUrl;
        break;
      default:
        break;
    }
    return {
      ...courseRunProps,
      ...rest,
    };
  };

  handleCollapsibleToggle = (isOpen) => {
    const { title } = this.props;
    this.setState({
      isOpen,
    });
    const {
      enterpriseConfig,
    } = this.context;
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.section.toggled',
      {
        is_open: isOpen,
        section_title: title,
      },
    );
  };

  renderCourseCards = () => this.props.courseRuns.map(courseRun => {
    const Component = CARD_COMPONENT_BY_COURSE_STATUS[courseRun.courseRunStatus];
    const isAuditEnrollment = courseRun.mode === COURSE_MODES.AUDIT;

    if (isAuditEnrollment && courseRun.courseRunStatus === COURSE_STATUSES.inProgress) {
      // if the enrollment is in audit mode and is in progress, it can be upgraded
      // and we want to wrap it in <UpgradeableCourseEnrollmentContextProvider />
      return (
        <UpgradeableCourseEnrollmentContextProvider
          courseEnrollment={courseRun}
          key={courseRun.courseRunId}
        >
          <Component
            {...this.getCourseRunProps(courseRun)}
          />
        </UpgradeableCourseEnrollmentContextProvider>
      );
    }

    return (
      <Component
        {...this.getCourseRunProps(courseRun)}
        key={courseRun.courseRunId}
      />
    );
  });

  render() {
    const { courseRuns } = this.props;
    if (!courseRuns || courseRuns.length === 0) {
      return null;
    }
    return (
      <div className="course-section mb-4">
        <Collapsible
          styling="card"
          title={this.getFormattedSectionTitle()}
          onOpen={() => this.handleCollapsibleToggle(true)}
          onClose={() => this.handleCollapsibleToggle(false)}
          defaultOpen
        >
          {this.getFormattedOptionalSubtitle()}
          {this.renderCourseCards()}
        </Collapsible>
      </div>
    );
  }
}

CourseSection.propTypes = {
  courseRuns: PropTypes.arrayOf(PropTypes.shape({
    courseRunId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    linkToCourse: PropTypes.string.isRequired,
    notifications: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    })).isRequired,
    microMastersTitle: PropTypes.string,
    mode: PropTypes.oneOf(Object.values(COURSE_MODES)),
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    linkToCertificate: PropTypes.string,
    hasEmailsEnabled: PropTypes.bool,
  })).isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

CourseSection.defaultProps = {
  subtitle: null,
};

CourseSection.contextType = AppContext;

export default CourseSection;
