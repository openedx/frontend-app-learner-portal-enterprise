import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';
import { connect } from 'react-redux';
import { faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StatusAlert, breakpoints, Row } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { LoadingSpinner } from '../../../loading-spinner';
import CourseSection from './CourseSection';
import { Sidebar } from '../../../layout';
import { DashboardSidebar } from '../../sidebar';
import {
  InProgressCourseCard,
  UpcomingCourseCard,
  CompletedCourseCard,
  SavedForLaterCourseCard,
} from './course-cards';

import { COURSE_STATUSES } from './data/constants';
import * as selectors from './data/selectors';
import * as actions from './data/actions';

export const COURSE_SECTION_TITLES = {
  inProgress: 'My courses in progress',
  upcoming: 'Upcoming courses',
  completed: 'Completed courses',
  savedForLater: 'Courses saved for later',
};

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
    this.hasCourseRunsWithStatus(COURSE_STATUSES.completed)
    || this.hasCourseRunsWithStatus(COURSE_STATUSES.inProgress)
    || this.hasCourseRunsWithStatus(COURSE_STATUSES.upcoming)
    || this.hasCourseRunsWithStatus(COURSE_STATUSES.savedForLater)
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
              Your course was saved for later.
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

  renderMoveToInProgressCourseSuccessAlert = () => {
    const { modifyIsMoveToInProgressCourseSuccess } = this.props;
    return (
      <StatusAlert
        alertType="success"
        dialog={(
          <div className="d-flex">
            <div>
              <FontAwesomeIcon className="mr-2" icon={faCheckCircle} />
            </div>
            <div>
              Your course was moved to In Progress.
            </div>
          </div>
        )}
        onClose={() => {
          modifyIsMoveToInProgressCourseSuccess({ isSuccess: false });
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
      isMarkCourseCompleteSuccess,
      isMoveToInProgressCourseSuccess,
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
        {isMoveToInProgressCourseSuccess && this.renderMoveToInProgressCourseSuccessAlert()}
        {/*
          Only render children if there are no course runs.
          This allows the parent component to customize what
          gets displayed if the user does not have any course runs.
        */}
        {!this.hasCourseRuns() && children}
        <CourseSection
          title={COURSE_SECTION_TITLES.inProgress}
          component={InProgressCourseCard}
          courseRuns={courseRuns.in_progress}
        />
        <MediaQuery maxWidth={breakpoints.medium.maxWidth}>
          {matches => matches && (
            <Row>
              <Sidebar data-testid="sidebar">
                <DashboardSidebar />
              </Sidebar>
            </Row>
          )}
        </MediaQuery>
        <CourseSection
          title={COURSE_SECTION_TITLES.upcoming}
          component={UpcomingCourseCard}
          courseRuns={courseRuns.upcoming}
        />
        <CourseSection
          title={COURSE_SECTION_TITLES.completed}
          component={CompletedCourseCard}
          courseRuns={courseRuns.completed}
        />
        <CourseSection
          title={COURSE_SECTION_TITLES.savedForLater}
          component={SavedForLaterCourseCard}
          courseRuns={courseRuns.saved_for_later}
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
  isMoveToInProgressCourseSuccess: selectors.getIsMoveToInProgressCourseSuccess(state),
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
  modifyIsMoveToInProgressCourseSuccess: (options) => {
    dispatch(actions.updateIsMoveToInProgressCourseSuccess(options));
  },
});

CourseEnrollments.propTypes = {
  fetchCourseEnrollments: PropTypes.func.isRequired,
  clearCourseEnrollments: PropTypes.func.isRequired,
  courseRuns: PropTypes.shape({
    in_progress: PropTypes.array.isRequired,
    upcoming: PropTypes.array.isRequired,
    completed: PropTypes.array.isRequired,
    saved_for_later: PropTypes.array.isRequired,
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
  isMarkCourseCompleteSuccess: PropTypes.bool.isRequired,
  modifyIsMarkCourseCompleteSuccess: PropTypes.func.isRequired,
  isMoveToInProgressCourseSuccess: PropTypes.bool.isRequired,
  modifyIsMoveToInProgressCourseSuccess: PropTypes.func.isRequired,
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
