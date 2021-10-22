import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import {
  Tooltip,
  OverlayTrigger,
  Collapsible,
} from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faCalendarAlt,
  faInfoCircle,
  faExclamationTriangle,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';

const overrideCollapsibleTitle = (courseTitle, courseUuid) => {
  /*
    Used to provide a tooltip to explain a non-traditional MIT course.
    Implementation ticket: MICROBA-562,
    Fix ticket: MICROBA-576.
    If this isn't fixed by the end of FY21, blame my product manager.
  */
  if (courseUuid !== '48708e7e-0152-4a4b-ad4c-2dadce29c87f') {
    return courseTitle;
  }

  // These is course related text, which will eventually be sourced from discovery. Since
  // it is course text and not general text, we will *not* be translating it
  const MIT_SDS_ASSESSMENT_COURSE_HEADER = 'Have you already taken Data Analysis for Social Scientists?';
  const MIT_SDS_ASSESSMENT_COURSE_EXPLANATION_PRE = 'You must first complete';
  const MIT_SDS_ASSESSMENT_COURSE_LINK_TEXT = '14.310x - Data Analysis for Social Scientists';
  const MIT_SDS_ASSESSMENT_COURSE_EXPLANATION_POST = 'with a passing grade in order to take this assessment and apply it to the MITx Statistics and Data Science MicroMasters program.';

  return (
    <div className="d-flex justify-content-between">
      <span>{courseTitle}</span>
      <OverlayTrigger
        key="top"
        placement="top"
        trigger={['click']}
        rootClose
        overlay={(
          <Tooltip id="tooltip-top" onClick={(e) => e.stopPropagation()}>
            <div style={{ maxWidth: '300px' }} className="border border-dark p-3 mb-3">
              <div>
                <strong>{MIT_SDS_ASSESSMENT_COURSE_HEADER}</strong>
              </div>
              <div>
                {MIT_SDS_ASSESSMENT_COURSE_EXPLANATION_PRE}&nbsp;
                <a
                  href="/course/data-analysis-for-social-scientists"
                  className="link"
                >
                  {MIT_SDS_ASSESSMENT_COURSE_LINK_TEXT}
                </a>&nbsp;
                {MIT_SDS_ASSESSMENT_COURSE_EXPLANATION_POST}
              </div>
            </div>
          </Tooltip>
        )}
      >
        {({ ref, onClick }) => (
          <div
            role="button"
            tabIndex="0"
            ref={ref}
            onClick={(e) => { e.stopPropagation(); onClick(e); }}
            onKeyUp={(e) => { e.preventDefault(); e.stopPropagation(); if (e.key === ' ') { onClick(e); } }}
            className="p-1 mr-1 ml-3 d-inline-block"
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </div>
        )}
      </OverlayTrigger>
    </div>
  );
};

const ProgramPathwayCourse = (props) => {
  const {
    courseTitle,
    courseIsActive,
    index,
    lastStep,
    courseLength,
    courseUuid,
    activeCourse,
    handleTogglePathway,
    courseRun,
    subtitle,
    prospectusPath,
    isBundled,
  } = props;

  // See overrideCollapsibleTitle docstring for explanation
  const collapsibleTitle = overrideCollapsibleTitle(courseTitle, courseUuid);

  return (
    <li
      key={courseTitle}
      className={classNames(
        'step',
        {
          'stand-out': courseIsActive,
          first: index === 0,
          last: lastStep === 'courses' && index + 1 === courseLength,
        },
      )}
    >
      <div className="path">
        <div className={classNames('marker', 'course', {
          first: index === 0,
          last: index + 1 === courseLength,
        })}
        > <FontAwesomeIcon icon={faBook} className="path-icon" />
        </div>
      </div>
      <div className="path-details">
        {courseUuid !== activeCourse
          && (
            <Collapsible
              title={collapsibleTitle}
              iconId={`program-pathway-title-icon-${courseUuid}`}
              onToggle={isOpen => handleTogglePathway(isOpen, courseTitle, courseUuid)}
            >
              {courseRun && courseRun.pacingType === 'instructor_paced'
                && (
                  <div className="font-weight-bold mb-2">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="stat-icon mr-1"
                    />
                  </div>
                )}
              {courseRun
               && courseRun.minEffort
               && courseRun.maxEffort
               && courseRun.weeksToComplete
               && (
                 <div className="font-weight-bold mb-2">
                   <FontAwesomeIcon icon={faClock} className="stat-icon mr-1" />
                 </div>
               )}
              {!courseRun
                && (
                  <div className="mb-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                    <span className="font-weight-bold">Not currently available</span>
                  </div>
                )}
              {/* eslint-disable-next-line */}
              <div className="mb-3" dangerouslySetInnerHTML={{ __html: subtitle }} />
              {courseRun
                && (
                  <div className="my-2">
                    <a
                      href={prospectusPath}
                      className={classNames({ 'btn-outline': !isBundled, 'inline-link': isBundled })}
                    >
                      <FormattedMessage
                        id="prospectus.program_pathway.view_course_link"
                        description="Link to the course details page"
                        defaultMessage="View the course"
                      />
                    </a>
                  </div>
                )}
            </Collapsible>
          )}
        {courseUuid === activeCourse
            && (
              <div className="collapsible">
                <div className="btn btn-block text-left btn-collapsible active-course">
                  <div className="collapsible-title d-flex justify-content-between">
                    <span>{courseTitle}</span>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="pin" />
                  </div>
                </div>
              </div>
            )}
      </div>
    </li>
  );
};

ProgramPathwayCourse.propTypes = {
  courseTitle: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  courseUuid: PropTypes.string.isRequired,
  prospectusPath: PropTypes.string.isRequired,
  courseRun: PropTypes.shape({
    key: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    marketingPath: PropTypes.string.isRequired,
    minEffort: PropTypes.number.isRequired,
    maxEffort: PropTypes.number.isRequired,
    pacingType: PropTypes.string,
    start: PropTypes.string,
    weeksToComplete: PropTypes.number.isRequired,
  }).isRequired,
  courseIsActive: PropTypes.bool.isRequired,
  lastStep: PropTypes.string,
  courseLength: PropTypes.number,
  activeCourse: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
  isBundled: PropTypes.bool.isRequired,
  handleTogglePathway: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

ProgramPathwayCourse.defaultProps = {
  activeCourse: false,
  lastStep: 'courses',
  courseLength: 0,
};

export default ProgramPathwayCourse;
