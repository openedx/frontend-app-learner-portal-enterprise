import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MediaQuery from 'react-responsive';
import { breakpoints, StatusAlert } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { LoadingSpinner } from '../../../loading-spinner';
import CourseSection from './CourseSection';
import {
  InProgressCourseCard,
  UpcomingCourseCard,
  CompletedCourseCard,
} from './course-cards';

import * as selectors from './data/selectors';
import * as actions from './data/actions';

const ARCHIVED_COURSES_SECTION_SUBTITLE = `This section contains both the 
  courses you have completed in the past and
  courses that have been voluntarily removed
  from your [in progress] list.'
`;

export class CourseEnrollments extends Component {
  componentDidMount() {
    const {
      enterpriseConfig: {
        uuid,
      },
    } = this.context;
    const { fetchCourseEnrollments } = this.props;
    const options = {};
    if (uuid) {
      options.uuid = uuid;
    }
    fetchCourseEnrollments(options);
  }

  componentWillUnmount() {
    const { clearCourseEnrollments } = this.props;
    clearCourseEnrollments();
  }

  hasCourseRunsWithStatus = (status) => {
    const { courseRuns } = this.props;
    return courseRuns && courseRuns[status] && courseRuns[status].length > 0;
  }

  hasCourseRuns = () => (
    this.hasCourseRunsWithStatus('completed')
    || this.hasCourseRunsWithStatus('in_progress')
    || this.hasCourseRunsWithStatus('upcoming')
  )

  renderError = () => (
    <StatusAlert
      alertType="danger"
      dialog={(
        <div className="d-flex">
          <div>
            <FontAwesomeIcon className="mr-2" icon={faExclamationTriangle} />
          </div>
          <div>
            An error occurred while retrieving your course enrollments. Please try again.
          </div>
        </div>
      )}
      dismissible={false}
      open
    />
  );

  renderMarkCourseCompleteSuccessAlert = () => {
    const { modifyIsMarkCourseCompleteSuccess } = this.props;
    return (
      <StatusAlert
        alertType="success"
        dialog={(
          <div className="d-flex">
            <div>
              <FontAwesomeIcon className="mr-2" icon={faCheckCircle} />
            </div>
            <div>
              Your course was archived.
            </div>
          </div>
        )}
        onClose={() => {
          modifyIsMarkCourseCompleteSuccess({ isSuccess: false });
        }}
        open
      />
    );
  };

  render() {
    const {
      children,
      courseRuns,
      isLoading,
      error,
      sidebarComponent,
      isMarkCourseCompleteSuccess,
    } = this.props;

    if (isLoading) {
      return <LoadingSpinner screenReaderText="loading course enrollments" />;
    }
    if (error) {
      return this.renderError();
    }

    return (
      <>
        {isMarkCourseCompleteSuccess && this.renderMarkCourseCompleteSuccessAlert()}
        {/*
          Only render children if there are no course runs.
          This allows the parent component to customize what
          gets displayed if the user does not have any course runs.
        */}
        {!this.hasCourseRuns() && children}
        <CourseSection
          title="My courses in progress"
          component={InProgressCourseCard}
          courseRuns={courseRuns.in_progress}
        />
        <MediaQuery minWidth={breakpoints.large.minWidth}>
          {matches => !matches && (
            <div className="mb-5">
              {sidebarComponent}
            </div>
          )}
        </MediaQuery>
        <CourseSection
          title="Upcoming courses"
          component={UpcomingCourseCard}
          courseRuns={courseRuns.upcoming}
        />
        <CourseSection
          title="Archived courses"
          subtitle={ARCHIVED_COURSES_SECTION_SUBTITLE}
          component={CompletedCourseCard}
          courseRuns={courseRuns.completed}
        />
      </>
    );
  }
}

CourseEnrollments.contextType = AppContext;

const mapStateToProps = state => ({
  courseRuns: selectors.getCourseRunsByStatus(state),
  isLoading: selectors.getIsLoading(state),
  error: selectors.getError(state),
  isMarkCourseCompleteSuccess: selectors.getIsMarkCourseCompleteSuccess(state),
});

const mapDispatchToProps = dispatch => ({
  fetchCourseEnrollments: (options) => {
    dispatch(actions.fetchCourseEnrollments(options));
  },
  clearCourseEnrollments: () => {
    dispatch(actions.clearCourseEnrollments());
  },
  modifyIsMarkCourseCompleteSuccess: (options) => {
    dispatch(actions.updateIsMarkCourseCompleteSuccess(options));
  },
});

CourseEnrollments.propTypes = {
  fetchCourseEnrollments: PropTypes.func.isRequired,
  clearCourseEnrollments: PropTypes.func.isRequired,
  courseRuns: PropTypes.shape({
    in_progress: PropTypes.array.isRequired,
    upcoming: PropTypes.array.isRequired,
    completed: PropTypes.array.isRequired,
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
  sidebarComponent: PropTypes.element.isRequired,
  isMarkCourseCompleteSuccess: PropTypes.bool.isRequired,
  modifyIsMarkCourseCompleteSuccess: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Error),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

CourseEnrollments.defaultProps = {
  error: null,
  children: null,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CourseEnrollments);
