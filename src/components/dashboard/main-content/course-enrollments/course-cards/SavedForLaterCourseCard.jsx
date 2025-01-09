import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { defineMessages, FormattedMessage } from '@edx/frontend-platform/i18n';

import BaseCourseCard, { getScreenReaderText } from './BaseCourseCard';
import ContinueLearningButton from './ContinueLearningButton';
import { MoveToInProgressModal } from './move-to-in-progress-modal';

import { isCourseEnded } from '../../../../../utils/common';
import { useUpdateCourseEnrollmentStatus } from '../data';
import { useEnterpriseCustomer } from '../../../../app/data';
import { COURSE_STATUSES } from '../../../../../constants';
import CourseEnrollmentsContext from '../CourseEnrollmentsContext';

const messages = defineMessages({
  unsaveCourseForLater: {
    id: 'enterprise.learner_portal.dashboard.enrollments.course.unsave_for_later',
    defaultMessage: 'Move to "In Progress" <s>for {courseTitle}</s>',
    description: 'Text for the unsave course for later button in the course card dropdown menu',
  },
});

const SavedForLaterCourseCard = (props) => {
  const {
    title,
    linkToCourse,
    courseRunId,
    endDate,
    isRevoked,
    startDate,
    mode,
    resumeCourseRunUrl,
  } = props;

  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const updateCourseEnrollmentStatus = useUpdateCourseEnrollmentStatus();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addCourseEnrollmentStatusChangeAlert } = useContext(CourseEnrollmentsContext);

  const handleMoveToInProgressOnClose = () => {
    setIsModalOpen(false);
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.course.move_to_in_progress.modal.closed',
      {
        course_run_id: courseRunId,
      },
    );
  };

  const handleMoveToInProgressOnSuccess = ({ response, resetModalState }) => {
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.course.move_to_in_progress.saved',
      {
        course_run_id: courseRunId,
      },
    );
    setIsModalOpen(false);
    resetModalState();
    updateCourseEnrollmentStatus({
      courseRunId: response.courseRunId,
      newStatus: response.courseRunStatus,
    });
    addCourseEnrollmentStatusChangeAlert(COURSE_STATUSES.inProgress);
    global.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
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
          sendEnterpriseTrackEvent(
            enterpriseCustomer.uuid,
            'edx.ui.enterprise.learner_portal.dashboard.course.move_to_in_progress.modal.opened',
            { course_run_id: courseRunId },
          );
        },
        children: (
          <div role="menuitem">
            <FormattedMessage
              {...messages.unsaveCourseForLater}
              values={{
                s: getScreenReaderText,
                courseTitle: title,
              }}
            />
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
        mode={mode}
        startDate={startDate}
        resumeCourseRunUrl={resumeCourseRunUrl}
      />
    );
  };

  return (
    <BaseCourseCard
      buttons={renderButtons()}
      dropdownMenuItems={getDropdownMenuItems()}
      type={COURSE_STATUSES.savedForLater}
      hasViewCertificateLink={false}
      mode={mode}
      startDate={startDate}
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
  endDate: PropTypes.string,
  startDate: PropTypes.string,
  mode: PropTypes.string,
  resumeCourseRunUrl: PropTypes.string,
};

SavedForLaterCourseCard.defaultProps = {
  linkToCertificate: null,
  endDate: null,
  startDate: null,
  mode: null,
  resumeCourseRunUrl: null,
};

export default SavedForLaterCourseCard;
