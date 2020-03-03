import React, { useContext } from 'react';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import {
  faTachometerAlt,
  faTag,
  faUniversity,
  faGraduationCap,
  faCertificate,
  faFileVideo,
} from '@fortawesome/free-solid-svg-icons';
import ISO6391 from 'iso-639-1';

import CourseContext from './CourseContext';
import CourseSidebarListItem from './CourseSidebarListItem';

import {
  useCourseSubjects,
  useCoursePartners,
  useCourseRunWeeksToComplete,
  useCourseTranscriptLanguages,
} from './data/hooks';

import './styles/CourseSidebar.scss';

export default function CourseSidebar() {
  const { course, activeCourseRun } = useContext(CourseContext);
  const { primarySubject } = useCourseSubjects(course);
  const [partners, institutionLabel] = useCoursePartners(course);
  const [weeksToComplete, weeksLabel] = useCourseRunWeeksToComplete(activeCourseRun);
  const [transcriptLanguages, transcriptLabel] = useCourseTranscriptLanguages(activeCourseRun);

  const formatProgramType = (programType) => {
    switch (programType.toLowerCase()) {
      case 'micromasters':
      case 'microbachelors':
        return <>{programType}<sup>&reg;</sup> Program</>;
      case 'masters':
        return 'Master\'s';
      default:
        return programType;
    }
  };

  return (
    <>
      <ul className="pl-0 mb-5 course-details-sidebar">
        {activeCourseRun.weeksToComplete && (
          <CourseSidebarListItem
            icon={faClock}
            label="Length"
            content={`${weeksToComplete} ${weeksLabel}`}
          />
        )}
        {activeCourseRun.minEffort && activeCourseRun.maxEffort && (
          <CourseSidebarListItem
            icon={faTachometerAlt}
            label="Effort"
            content={`${activeCourseRun.minEffort}-${activeCourseRun.maxEffort} hours per week`}
          />
        )}
        <CourseSidebarListItem
          icon={faTag}
          label="Price"
          content="Free"
        />
        {partners && partners.length > 0 && (
          <CourseSidebarListItem
            icon={faUniversity}
            label={institutionLabel}
            content={partners.map(partner => (
              <span key={partner.key} className="d-block">
                <a href={partner.fullUrl}>
                  {partner.key}
                </a>
              </span>
            ))}
          />
        )}
        {primarySubject && (
          <CourseSidebarListItem
            icon={faGraduationCap}
            label="Subject"
            content={(
              <a href={primarySubject.url}>
                {primarySubject.name}
              </a>
            )}
          />
        )}
        {activeCourseRun.levelType && (
          <CourseSidebarListItem
            icon={faCertificate}
            label="Level"
            content={course.levelType}
          />
        )}
        {activeCourseRun.contentLanguage && (
          <CourseSidebarListItem
            icon={faUniversity}
            label="Language"
            content={ISO6391.getNativeName(activeCourseRun.contentLanguage.slice(0, 2))}
          />
        )}
        {transcriptLanguages && transcriptLanguages.length > 0 && (
          <CourseSidebarListItem
            icon={faFileVideo}
            label={transcriptLabel}
            content={transcriptLanguages.map(language => (
              ISO6391.getNativeName(language.slice(0, 2))
            )).join(', ')}
          />
        )}
      </ul>
      {course.programs && course.programs.length > 0 && (
        <div className="associated-programs mb-5">
          <h3>Associated Programs</h3>
          <ul className="pl-0" style={{ listStyleType: 'none' }}>
            {course.programs.map(program => (
              <li key={program.uuid} className="mb-3">
                <a
                  href={`${process.env.MARKETING_SITE_URL}/${program.marketingUrl}`}
                  className="font-weight-bold"
                >
                  {program.title}
                </a>
                <div>{formatProgramType(program.type)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {course.prerequisitesRaw && (
        <div className="prerequisites mb-5">
          <h3>Prerequisites</h3>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: course.prerequisitesRaw }} />
        </div>
      )}
    </>
  );
}
