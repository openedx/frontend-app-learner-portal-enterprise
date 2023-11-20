import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import classNames from 'classnames';
import { Button, Hyperlink } from '@edx/paragon';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import dayjs from 'dayjs';
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

  const isCourseStarted = () => dayjs(startDate) <= dayjs();
  const isExecutiveEducation2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);
  const disabled = !isCourseStarted() ? 'disabled' : undefined;
  const variant = isExecutiveEducation2UCourse ? 'inverse-primary' : 'primary';

  const renderContent = () => {
    if (!isCourseStarted() && startDate) {
      return 'Start course';
    }
    return 'Resume';
  };

  return (
    <Button
      as={Hyperlink}
      destination={linkToCourse}
      className={classNames('btn-xs-block', disabled, className)}
      onClick={onClickHandler}
      variant={variant}
    >
      {renderContent()}
      <span className="sr-only">for {title}</span>
    </Button>
  );
};

ContinueLearningButton.defaultProps = {
  className: null,
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
