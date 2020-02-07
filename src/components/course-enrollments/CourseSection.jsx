import React from 'react';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { Collapsible } from '@edx/paragon';
import { faChevronCircleUp, faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';

import {
  InProgressCourseCard,
  UpcomingCourseCard,
  CompletedCourseCard,
} from './course-cards';
import CollapsibleIcon from './CollapsibleIcon';

import './styles/CourseSection.scss';

class CourseSection extends React.Component {
  state = {
    isOpen: true,
  };

  getFormattedSectionTitle = () => {
    const { isOpen } = this.state;
    const { courseRuns, title } = this.props;
    const sectionTitle = isOpen ? title : `${title} (${courseRuns.length})`;
    return <h2>{sectionTitle}</h2>;
  };

  getCourseRunProps = ({
    linkToCertificate,
    notifications,
    courseRunStatus,
    ...rest
  }) => {
    const courseRunProps = {};
    switch (courseRunStatus) {
      case 'in_progress':
        courseRunProps.linkToCertificate = linkToCertificate;
        courseRunProps.notifications = notifications;
        break;
      case 'completed':
        courseRunProps.linkToCertificate = linkToCertificate;
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
    sendTrackEvent('edx.learner_portal.section.toggled', {
      is_open: isOpen,
      section_title: title,
    });
  };

  renderCourseCards = () => {
    const { component: Component, courseRuns } = this.props;
    return courseRuns.map(courseRun => (
      <Component
        {...this.getCourseRunProps(courseRun)}
        key={courseRun.courseRunId}
      />
    ));
  };

  render() {
    const { courseRuns } = this.props;
    if (!courseRuns || courseRuns.length === 0) {
      return null;
    }
    return (
      <div className="course-section mb-4">
        <Collapsible
          styling="card-lg"
          className="border-0 shadow-none"
          title={this.getFormattedSectionTitle()}
          iconWhenOpen={<CollapsibleIcon icon={faChevronCircleUp} />}
          iconWhenClosed={<CollapsibleIcon icon={faChevronCircleDown} />}
          onOpen={() => this.handleCollapsibleToggle(true)}
          onClose={() => this.handleCollapsibleToggle(false)}
          defaultOpen
        >
          {this.renderCourseCards()}
        </Collapsible>
      </div>
    );
  }
}

CourseSection.propTypes = {
  component: PropTypes.oneOf([
    InProgressCourseCard,
    UpcomingCourseCard,
    CompletedCourseCard,
  ]).isRequired,
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
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    linkToCertificate: PropTypes.string,
    hasEmailsEnabled: PropTypes.bool,
  })).isRequired,
  title: PropTypes.string.isRequired,
};

export default CourseSection;
