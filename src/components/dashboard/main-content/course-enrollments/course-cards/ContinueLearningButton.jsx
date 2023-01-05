import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import classNames from 'classnames';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

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
  return (
    <a
      className={classNames('btn btn-xs-block', className)}
      href={linkToCourse}
      onClick={onClickHandler}
    >
      Resume
      <span className="sr-only">for {title}</span>
    </a>
  );
};

ContinueLearningButton.defaultProps = {
  className: 'btn-outline-primary',
};

ContinueLearningButton.propTypes = {
  className: PropTypes.string,
  linkToCourse: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  courseRunId: PropTypes.string.isRequired,
};

export default ContinueLearningButton;
