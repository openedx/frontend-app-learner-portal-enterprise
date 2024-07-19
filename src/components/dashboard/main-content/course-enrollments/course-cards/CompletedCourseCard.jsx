import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { Hyperlink } from '@openedx/paragon';
import classNames from 'classnames';

import BaseCourseCard from './BaseCourseCard';
import ContinueLearningButton from './ContinueLearningButton';
import { isCourseEnded } from '../../../../../utils/common';
import CertificateImg from './images/edx-verified-mini-cert.png';
import { EXECUTIVE_EDUCATION_COURSE_MODES } from '../../../../app/data';

const CompletedCourseCard = (props) => {
  const { authenticatedUser: { username } } = useContext(AppContext);
  const {
    title,
    linkToCourse,
    courseRunId,
    startDate,
    endDate,
    mode,
    resumeCourseRunUrl,
  } = props;
  const config = getConfig();

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

  const isExecutiveEducation2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);

  const renderCertificateInfo = () => (
    props.linkToCertificate ? (
      <div className="d-flex">
        <div className="mr-3">
          <img src={CertificateImg} alt="verified certificate preview" />
        </div>
        <div className="d-flex align-items-center">
          <div className="mb-0 small">
            View your certificate on{' '}
            <Hyperlink
              destination={`${config.LMS_BASE_URL}/u/${username}`}
              target="_blank"
              className={classNames('text-underline', {
                'text-light-200': isExecutiveEducation2UCourse,
              })}
            >
              your profile →
            </Hyperlink>
          </div>
        </div>
      </div>
    ) : (
      <div className="small">
        To earn a certificate,{' '}
        <Hyperlink
          destination={props.linkToCourse}
          className={classNames('text-underline', {
            'text-light-200': isExecutiveEducation2UCourse,
          })}
        >
          retake this course →
        </Hyperlink>
      </div>
    )
  );

  return (
    <BaseCourseCard
      buttons={renderButtons()}
      type="completed"
      hasViewCertificateLink={false}
      mode={mode}
      startDate={startDate}
      {...props}
    >
      {renderCertificateInfo()}
    </BaseCourseCard>
  );
};

CompletedCourseCard.propTypes = {
  linkToCourse: PropTypes.string.isRequired,
  courseRunId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  linkToCertificate: PropTypes.string,
  courseRunStatus: PropTypes.string.isRequired,
  endDate: PropTypes.string,
  startDate: PropTypes.string,
  mode: PropTypes.string,
  resumeCourseRunUrl: PropTypes.string,
};

CompletedCourseCard.defaultProps = {
  linkToCertificate: null,
  endDate: null,
  startDate: null,
  mode: null,
  resumeCourseRunUrl: null,
};

export default CompletedCourseCard;
