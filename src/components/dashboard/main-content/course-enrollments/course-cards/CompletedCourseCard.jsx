import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { courseEnded } from '../../../../../utils/common';
import ContinueLearningButton from './ContinueLearningButton';

import {
  updateCourseRunStatus,
  updateIsUnarchiveCourseSuccess,
} from '../data/actions';

import BaseCourseCard from './BaseCourseCard';

import { UnarchiveModal } from './unarchive-modal';

import CertificateImg from './images/edx-verified-mini-cert.png';

const CompletedCourseCard = (props) => {
  const user = getAuthenticatedUser();
  const { username } = user;
  const {
    markedDone,
    title,
    linkToCourse,
    courseRunId,
    modifyCourseRunStatus,
    modifyIsUnarchiveCourseStatus,
    endDate,
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleUnarchiveOnClose = () => {
    setIsModalOpen(false);
    sendTrackEvent('edx.learner_portal.course.unarchive.modal.closed', {
      course_run_id: courseRunId,
    });
  };

  const handleUnarchiveOnSuccess = ({ response, resetModalState }) => {
    sendTrackEvent('edx.learner_portal.course.unarchive.saved', {
      course_run_id: courseRunId,
    });
    setIsModalOpen(false);
    resetModalState();
    modifyCourseRunStatus({
      status: response.courseRunStatus,
      courseId: response.courseRunId,
      markedDone: response.markedDone.toLowerCase() === 'true',
    });
    modifyIsUnarchiveCourseStatus({
      isSuccess: true,
    });
  };

  const getDropdownMenuItems = () => {
    // Only courses that are manually archived (markedDone)
    // should show a unarchive option.
    // if course is ended, you cannot unarchive it
    if (!markedDone || courseEnded(endDate)) { return []; }
    return ([
      {
        key: 'unarchive-course',
        type: 'button',
        onClick: () => {
          setIsModalOpen(true);
          sendTrackEvent('edx.learner_portal.course.unarchive.modal.opened', {
            course_run_id: courseRunId,
          });
        },
        children: (
          <div role="menuitem">
            Unarchive course
            <span className="sr-only">for {title}</span>
          </div>
        ),
      },
    ]);
  };

  const renderButtons = () => {
    if (courseEnded(endDate)) { return null; }
    return (
      <ContinueLearningButton
        linkToCourse={linkToCourse}
        title={title}
        courseRunId
      />
    );
  };

  const renderCertificateInfo = () => (
    props.linkToCertificate ? (
      <div className="d-flex mb-3">
        <div className="mr-3">
          <img src={CertificateImg} alt="verified certificate preview" />
        </div>
        <div className="d-flex align-items-center">
          <p className="lead mb-0 font-weight-normal">
            View your certificate on{' '}
            <a
              className="text-underline"
              href={`${process.env.LMS_BASE_URL}/u/${username}`}
            >
              your profile →
            </a>
          </p>
        </div>
      </div>
    ) : (
      <p className="lead mb-3 font-weight-normal">
        To earn a certificate,{' '}
        <a className="text-underline" href={props.linkToCourse}>
          retake this course →
        </a>
      </p>
    )
  );

  return (
    <BaseCourseCard
      buttons={renderButtons()}
      dropdownMenuItems={getDropdownMenuItems({ markedDone })}
      type="completed"
      hasViewCertificateLink={false}
      {...props}
    >
      {renderCertificateInfo()}
      <UnarchiveModal
        isOpen={isModalOpen}
        courseTitle={title}
        courseLink={linkToCourse}
        courseId={courseRunId}
        onClose={handleUnarchiveOnClose}
        onSuccess={handleUnarchiveOnSuccess}
      />
    </BaseCourseCard>
  );
};

CompletedCourseCard.propTypes = {
  linkToCourse: PropTypes.string.isRequired,
  courseRunId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  linkToCertificate: PropTypes.string,
  markedDone: PropTypes.bool.isRequired,
  modifyCourseRunStatus: PropTypes.func.isRequired,
  modifyIsUnarchiveCourseStatus: PropTypes.func.isRequired,
  endDate: PropTypes.string,
};

CompletedCourseCard.defaultProps = {
  linkToCertificate: null,
  endDate: null,
};

const mapDispatchToProps = dispatch => ({
  modifyCourseRunStatus: (options) => {
    // TODO remove this override of status once api is fixed
    dispatch(updateCourseRunStatus({ ...options, status: 'in_progress' }));
  },
  modifyIsUnarchiveCourseStatus: (options) => {
    dispatch(updateIsUnarchiveCourseSuccess(options));
  },
});

export default connect(null, mapDispatchToProps)(CompletedCourseCard);
