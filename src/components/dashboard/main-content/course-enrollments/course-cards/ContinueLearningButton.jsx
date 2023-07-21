import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import classNames from 'classnames';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import moment from 'moment';
import { EXECUTIVE_EDUCATION_COURSE_MODES } from '../../../../../constants';
/**
 * A 'Continue Learning' button with parameters.
 *
 * @param {object} params Params.
 * @param {string} params.linkToCourse hyperlink to course on LMS.
 * @param {string} params.title course title.
 * @param {Function} params.courseRunId
 *
 * @returns {Function} A functional React component for the continue learning button.
 */
const ContinueLearningButton = ({
  className,
  linkToCourse,
  title,
  courseRunId,
  startDate,
  mode,
}) => {
  const { enterpriseConfig } = useContext(AppContext);

  const onClickHandler = () => {
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.course.continued',
      {
        course_run_id: courseRunId,
      },
    );
  };

  const isCourseStarted = () => moment(startDate) <= moment();
  const isExecutiveEducation2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);
  const execClassName = (isExecutiveEducation2UCourse) && (!isCourseStarted()) ? ' disabled btn-outline-secondary' : undefined;

  const renderContent = () => {
    if (isExecutiveEducation2UCourse && !isCourseStarted() && startDate) {
      const formattedStartDate = moment(startDate).format('MMM D, YYYY');
      return `Available on ${formattedStartDate}`;
    }
    return 'Resume';
  };

  return (
    <a
      className={classNames('btn btn-xs-block', execClassName, className)}
      href={linkToCourse}
      onClick={onClickHandler}
    >
      {renderContent()}
      <span className="sr-only">for {title}</span>
    </a>
  );
};

ContinueLearningButton.defaultProps = {
  className: 'btn-outline-primary',
  startDate: null,
  mode: null,
};

ContinueLearningButton.propTypes = {
  className: PropTypes.string,
  linkToCourse: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  courseRunId: PropTypes.string.isRequired,
  startDate: PropTypes.string,
  mode: PropTypes.string,
};

export default ContinueLearningButton;
