import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import BaseCourseCard from './BaseCourseCard';
import ContinueLearningButton from './ContinueLearningButton';
import { MoveToInProgressModal } from './move-to-in-progress-modal';

import { isCourseEnded } from '../../../../../utils/common';
import {
  updateCourseRunStatus,
  updateIsMoveToInProgressCourseSuccess,
} from '../data/actions';
import { COURSE_STATUSES } from '../data/constants';

const SavedForLaterCourseCard = (props) => {
  const {
    title,
    linkToCourse,
    courseRunId,
    modifyCourseRunStatus,
    modifyIsMoveToInProgressCourseStatus,
    endDate,
    isRevoked,
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMoveToInProgressOnClose = () => {
    setIsModalOpen(false);
    sendTrackEvent('edx.learner_portal.dashboard.course.move_to_in_progress.modal.closed', {
      course_run_id: courseRunId,
    });
  };

  const handleMoveToInProgressOnSuccess = ({ response, resetModalState }) => {
    sendTrackEvent('edx.learner_portal.dashboard.course.move_to_in_progress.saved', {
      course_run_id: courseRunId,
    });
    setIsModalOpen(false);
    resetModalState();
    modifyCourseRunStatus({
      status: response.courseRunStatus,
      courseId: response.courseRunId,
      savedForLater: response.savedForLater,
    });
    modifyIsMoveToInProgressCourseStatus({
      isSuccess: true,
    });
  };

  const getDropdownMenuItems = () => {
    // Only non-revoked courses should show an option to move back to in progress. if course is
    // ended or completed, you cannot move it back to in progress.
    if (isRevoked || isCourseEnded(endDate)) {
      return [];
    }

    return ([
      {
        key: 'move-course-to-in-progress',
        type: 'button',
        onClick: () => {
          setIsModalOpen(true);
          sendTrackEvent('edx.learner_portal.dashboard.course.move_to_in_progress.modal.opened', {
            course_run_id: courseRunId,
          });
        },
        children: (
          <div role="menuitem">
            Move to In Progress
            <span className="sr-only">for {title}</span>
          </div>
        ),
      },
    ]);
  };

  const renderButtons = () => {
    if (isCourseEnded(endDate)) {
      return null;
    }

    return (
      <ContinueLearningButton
        linkToCourse={linkToCourse}
        title={title}
        courseRunId={courseRunId}
      />
    );
  };

  return (
    <BaseCourseCard
      buttons={renderButtons()}
      dropdownMenuItems={getDropdownMenuItems()}
      type={COURSE_STATUSES.savedForLater}
      hasViewCertificateLink={false}
      {...props}
    >
      <MoveToInProgressModal
        isOpen={isModalOpen}
        courseTitle={title}
        courseLink={linkToCourse}
        courseId={courseRunId}
        onClose={handleMoveToInProgressOnClose}
        onSuccess={handleMoveToInProgressOnSuccess}
      />
    </BaseCourseCard>
  );
};

SavedForLaterCourseCard.propTypes = {
  linkToCourse: PropTypes.string.isRequired,
  courseRunId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  linkToCertificate: PropTypes.string,
  isRevoked: PropTypes.bool.isRequired,
  courseRunStatus: PropTypes.string.isRequired,
  modifyCourseRunStatus: PropTypes.func.isRequired,
  modifyIsMoveToInProgressCourseStatus: PropTypes.func.isRequired,
  endDate: PropTypes.string,
};

SavedForLaterCourseCard.defaultProps = {
  linkToCertificate: null,
  endDate: null,
};

const mapDispatchToProps = dispatch => ({
  modifyCourseRunStatus: (options) => {
    dispatch(updateCourseRunStatus({ ...options }));
  },
  modifyIsMoveToInProgressCourseStatus: (options) => {
    dispatch(updateIsMoveToInProgressCourseSuccess({ ...options }));
  },
});

export default connect(null, mapDispatchToProps)(SavedForLaterCourseCard);
