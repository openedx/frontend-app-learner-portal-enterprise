import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import classNames from 'classnames';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import moment from 'moment';
import { EXEC_ED_COURSE_TYPE, PRODUCT_SOURCE_2U } from '../data/constants';

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
  courseType,
  productSource,
  startDate,
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

  const execClassName = (courseType === EXEC_ED_COURSE_TYPE && productSource === PRODUCT_SOURCE_2U) && (!isCourseStarted()) ? ' disabled btn-outline-secondary' : undefined;

  const renderContent = () => {
    if ((courseType === EXEC_ED_COURSE_TYPE && productSource === PRODUCT_SOURCE_2U) && !isCourseStarted()) {
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
  courseType: null,
  productSource: null,
};

ContinueLearningButton.propTypes = {
  className: PropTypes.string,
  linkToCourse: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  courseRunId: PropTypes.string.isRequired,
  startDate: PropTypes.string,
  courseType: PropTypes.string,
  productSource: PropTypes.string,
};

export default ContinueLearningButton;
