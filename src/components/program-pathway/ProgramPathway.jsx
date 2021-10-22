/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Collapsible } from '@edx/paragon';
import { FormattedMessage } from 'react-intl';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCompass,
  faGraduationCap,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';

import ProgramPathwayCourse from './ProgramPathwayCourse';

class ProgramPathway extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeCourses: [],
      // For program track selection. These are filled by the findElectives
      // function if there is a linked program; these will be empty for most
      // programs
      electivesChecked: false,
      electiveCourses: [],
      requiredCourses: [],
    };
    this.handleTogglePathway = this.handleTogglePathway.bind(this);
  }

  handleTogglePathway(isOpen, title, uuid = '') {
    const componentProps = {
      category: 'navigation',
      label: title,
      isOpen,
    };

    const { activeCourses } = this.state;

    if (isOpen) {
      this.setState({
        activeCourses: [...activeCourses, uuid],
      });
    } else {
      this.setState({
        activeCourses: activeCourses.filter(course => course !== uuid),
      });
    }
  }

  getLastStep() {
    const {
      credentialInfo,
      jobOutlook,
    } = this.props;

    if (jobOutlook.length > 0) {
      return 'job-outlook';
    }

    if (credentialInfo && credentialInfo.length > 0) {
      return 'credential-info';
    }

    return 'courses';
  }

  getCertificateLabel(type) {
    /**
     * Professional Certificates/Xseries don't have credentials, but they put random program
     * information in the credentials section, so we just call it `Details`
     */
    return (
      <FormattedMessage
        id="prospectus.program_pathway.type_details"
        description="Introduce details of this program type"
        defaultMessage={'{typeKey, select, '
          + 'micromasters {Certificate & Credit Pathways} '
          + 'professional_certificate {{type} Details} '
          + 'xseries {{type} Details} '
          + 'microbachelors {Program Certificate & College Credit}'
          + 'other {{type} Certificate}}'}
        values={{ type, typeKey: type }}
      />
    );
  }

  courseIsActive(uuid) {
    const { activeCourses } = this.state;

    return activeCourses.indexOf(uuid) > -1;
  }

  // For program track selection. Compare the course lists from the
  // program and linked program to find which are "electives" and which are
  // required. Save these in state.
  findElectives() {
    const {
      programCourses,
      linkedProgramCourses,
    } = this.props;

    const programCourseUuids = programCourses.map(course => course.uuid);
    const linkedprogramCourseUuids = linkedProgramCourses.map(course => course.uuid);

    // The required courses are all the courses in the program that are also in
    // the linked program.
    const requiredCourses = programCourses.filter(course => linkedprogramCourseUuids.includes(course.uuid));

    // The elective courses are all the courses in the program that are not in
    // the linked program, and all the courses in the linked program that are
    // are not in the program (there should only be one of each).
    const uniqueProgramCourses = programCourses.filter(course => !linkedprogramCourseUuids.includes(course.uuid));
    const uniqueLinkedProgramCourses = linkedProgramCourses.filter(course => !programCourseUuids.includes(course.uuid));
    const electiveCourses = uniqueProgramCourses.concat(uniqueLinkedProgramCourses);

    this.setState({ electivesChecked: true, electiveCourses, requiredCourses });
  }

  renderCourses(courseArray, lastStep, courseLength, activeCourse, isBundled) {
    return courseArray.map(({
      activeCourseRun: courseRun,
      title: courseTitle,
      subtitle,
      uuid: courseUuid,
      prospectusPath,
    }, index) => (
      <ProgramPathwayCourse
        key={courseTitle}
        courseTitle={courseTitle}
        subtitle={subtitle}
        courseUuid={courseUuid}
        prospectusPath={prospectusPath}
        courseRun={courseRun}
        courseIsActive={this.courseIsActive(courseUuid)}
        lastStep={lastStep}
        courseLength={courseLength}
        activeCourse={activeCourse}
        isBundled={isBundled}
        handleTogglePathway={this.handleTogglePathway}
        index={index}
      />
    ));
  }

  render() {
    const {
      title,
      type,
      activeCourse,
      programCourses,
      credentialInfo,
      jobOutlook,
      owners,
      isBundled,
      linkedProgramCourses,
    } = this.props;
    const courseLength = programCourses.length;
    const finalCertificate = 'Test Certificate.';
    const lastStep = this.getLastStep();
    /*
      Removed for rebrand until design can be revisited
      Implementation ticket: MICROBA-834
      Fix ticket: MICROBA-836
    */
    // const showProgramLogo = type.toLowerCase() === 'micromasters';
    const showProgramLogo = false;

    // For program track selection. If this program has a linked program,
    // we need to sort out the courses (if we haven’t already)
    const { electivesChecked, electiveCourses, requiredCourses } = this.state;
    if (linkedProgramCourses && !electivesChecked) { this.findElectives(); }
    const courses = electivesChecked ? requiredCourses : programCourses;

    return (
      <div className="program-pathway-component interactive">
        <ol className="pathway">
          <li
            key="program-title"
            className="step title"
          >
            <div className="path">
              <div className="marker">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="path-icon" />
              </div>
            </div>
            <div className="path-details d-flex flex-row">
              <div className={classNames({ 'col-lg-8': showProgramLogo })}>
                <h2 className="program-pathway-title">
                  <FormattedMessage
                    id="prospectus.program_pathway.owner_title_type"
                    description="Title describing whose program this is and its type"
                    defaultMessage={'{ownersList}\'s {title} {programType}'}
                    values={{
                      ownersList: owners,
                      title,
                      programType: type,
                    }}
                  />
                </h2>
              </div>
              {showProgramLogo
                && (
                  <div className="program-logo-wrapper col-lg-4">
                    <img
                      className="program-logo"
                      src="/images/program/mm-logo-blue.png"
                      alt=""
                    />
                  </div>
                )}
            </div>
          </li>
          {linkedProgramCourses
            && requiredCourses.length > 0
            && (
              <li className="step course-group-heading">
                <div className="path">
                  <div className="marker" />
                </div>
                <div className="path-details">
                  <h3 className="program-pathway-course-group-heading">
                    <FormattedMessage
                      id="prospectus.program_pathway.course-group-heading-complete-all"
                      description="Heading indicating courses to be completed"
                      defaultMessage="Complete all:"
                    />
                  </h3>
                </div>
              </li>
            )}
          {this.renderCourses(courses, lastStep, courseLength, activeCourse, isBundled)}
          {linkedProgramCourses
            && electiveCourses.length > 0
            && (
              <li className="step course-group-heading">
                <div className="path">
                  <div className="marker" />
                </div>
                <div className="path-details">
                  <h3 className="program-pathway-course-group-heading">
                    <FormattedMessage
                      id="prospectus.program_pathway.course-group-heading-select-one"
                      description="Heading indicating a choice between two courses"
                      defaultMessage="Select one:"
                    />
                  </h3>
                </div>
              </li>
            )}
          {linkedProgramCourses
            && electiveCourses.length > 0
            && this.renderCourses(this.state.electiveCourses, lastStep, courseLength, activeCourse, isBundled)}
          {linkedProgramCourses
            && (
              <li className="step course-group-heading py-4">
                <div className="path">
                  <div className="marker" />
                </div>
              </li>
            )}
          {credentialInfo && credentialInfo.length > 0
            && (
              <li
                key="credential-info"
                className={classNames('step', 'outcome', { last: lastStep === 'credential-info' })}
              >
                <div className="path">
                  <div className="marker">
                    <FontAwesomeIcon icon={faGraduationCap} className="path-icon" />
                  </div>
                </div>
                <div className="path-details">
                  <Collapsible title={finalCertificate} iconId="program-pathway-certificate-icon">
                    <div className="program-credential" dangerouslySetInnerHTML={{ __html: credentialInfo }} />
                  </Collapsible>
                </div>
              </li>
            )}
          {jobOutlook && jobOutlook.length > 0
            && (
              <li
                key="job-outlook"
                className={classNames('step', 'outcome', { last: lastStep === 'job-outlook' })}
              >
                <div className="path">
                  <div className="marker">
                    <FontAwesomeIcon icon={faCompass} className="path-icon" />
                  </div>
                </div>
                <div className="path-details">
                  <Collapsible
                    iconId="program-pathway-job-outlook-icon"
                    onToggle={isOpen => this.handleTogglePathway(isOpen)}
                  >
                    <ul className="overview-info pl-3">
                      {jobOutlook.map(paragraph => <li key={paragraph}>{paragraph}</li>)}
                    </ul>
                  </Collapsible>
                </div>
              </li>
            )}
        </ol>
      </div>
    );
  }
}

ProgramPathway.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  programCourses: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    activeCourseRun: PropTypes.shape({
      key: PropTypes.string.isRequired,
      uuid: PropTypes.string.isRequired,
      marketingPath: PropTypes.string.isRequired,
      minEffort: PropTypes.number.isRequired,
      maxEffort: PropTypes.number.isRequired,
      weeksToComplete: PropTypes.number.isRequired,
    }),
    inProspectus: PropTypes.bool,
    prospectusPath: PropTypes.string,
  })).isRequired,
  linkedProgramCourses: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    activeCourseRun: PropTypes.shape({
      key: PropTypes.string.isRequired,
      uuid: PropTypes.string.isRequired,
      marketingPath: PropTypes.string.isRequired,
      minEffort: PropTypes.number.isRequired,
      maxEffort: PropTypes.number.isRequired,
      weeksToComplete: PropTypes.number.isRequired,
    }),
    inProspectus: PropTypes.bool,
    prospectusPath: PropTypes.string,
  })),
  owners: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    key: PropTypes.string,
    logoImageUrl: PropTypes.string,
  })).isRequired,
  activeCourse: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
  credentialInfo: PropTypes.string,
  jobOutlook: PropTypes.arrayOf(PropTypes.string).isRequired,
  isBundled: PropTypes.bool.isRequired,
};

ProgramPathway.defaultProps = {
  activeCourse: false,
  credentialInfo: '',
  linkedProgramCourses: null,
};

export default ProgramPathway;
