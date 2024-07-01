import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, Hyperlink } from '@openedx/paragon';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import dayjs from 'dayjs';
import { EXECUTIVE_EDUCATION_COURSE_MODES, useEnterpriseCustomer } from '../../../../app/data';
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
  resumeCourseRunUrl,
}) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  const onClickHandler = () => {
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.course.continued',
      {
        course_run_id: courseRunId,
      },
    );
  };

  const isCourseStarted = () => dayjs(startDate) <= dayjs();
  const isExecutiveEducation2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(mode);
  const disabled = !isCourseStarted() ? 'disabled' : undefined;
  const variant = isExecutiveEducation2UCourse ? 'inverse-primary' : 'outline-primary';

  const renderContent = () => {
    // resumeCourseRunUrl indicates that learner has made progress, available only if the learner has started learning.
    // The "Start Course" is visible either when the course has not started or when the course has started but the
    // learner has not yet begun the learning.
    if ((!isCourseStarted() && startDate) || (isCourseStarted && !resumeCourseRunUrl)) {
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
  resumeCourseRunUrl: null,
};

ContinueLearningButton.propTypes = {
  className: PropTypes.string,
  linkToCourse: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  courseRunId: PropTypes.string.isRequired,
  startDate: PropTypes.string,
  mode: PropTypes.string,
  resumeCourseRunUrl: PropTypes.string,
};

export default ContinueLearningButton;
