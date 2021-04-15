import React, { useContext } from 'react';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import {
  faTachometerAlt,
  faTag,
  faUniversity,
  faGraduationCap,
  faCertificate,
  faFileVideo,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import ISO6391 from 'iso-639-1';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { Hyperlink } from '@edx/paragon';
import { CourseContext } from './CourseContextProvider';
import CourseSidebarListItem from './CourseSidebarListItem';
import CourseAssociatedPrograms from './CourseAssociatedPrograms';
import CourseSidebarPrice from './CourseSidebarPrice';

import { isDefinedAndNotNull, hasTruthyValue } from '../../utils/common';
import {
  useCourseSubjects,
  useCoursePartners,
  useCourseRunWeeksToComplete,
  useCourseTranscriptLanguages,
  useCoursePacingType,
} from './data/hooks';

export default function CourseSidebar() {
  const { state } = useContext(CourseContext);
  const { course, activeCourseRun } = state;
  const { primarySubject } = useCourseSubjects(course);
  const [partners, institutionLabel] = useCoursePartners(course);
  const [weeksToComplete, weeksLabel] = useCourseRunWeeksToComplete(activeCourseRun);
  const [transcriptLanguages, transcriptLabel] = useCourseTranscriptLanguages(activeCourseRun);
  const [pacingType, pacingTypeContent] = useCoursePacingType(activeCourseRun);

  return (
    <>
      <ul className="pl-0 mb-5 course-details-sidebar">
        {isDefinedAndNotNull(activeCourseRun) && (
          <>
            {hasTruthyValue(activeCourseRun.weeksToComplete) && (
              <CourseSidebarListItem
                icon={faClock}
                label="Length"
                content={`${weeksToComplete} ${weeksLabel}`}
              />
            )}
            {hasTruthyValue([activeCourseRun.minEffort, activeCourseRun.maxEffort]) && (
              <CourseSidebarListItem
                icon={faTachometerAlt}
                label="Effort"
                content={`${activeCourseRun.minEffort}-${activeCourseRun.maxEffort} hours per week`}
              />
            )}
          </>
        )}
        <CourseSidebarListItem
          icon={faTag}
          label="Price"
          content={<CourseSidebarPrice />}
        />
        {partners?.length > 0 && (
          <CourseSidebarListItem
            icon={faUniversity}
            label={institutionLabel}
            content={partners.map(partner => (
              <span key={partner.key} className="d-block">
                <Hyperlink
                  destination={partner.marketingUrl}
                  target="_blank"
                  onClick={() => {
                    sendTrackEvent('edx.learner_portal.course.sidebar.partner.clicked', {
                      partner_name: partner.key,
                    });
                  }}
                >
                  {partner.key}
                </Hyperlink>
              </span>
            ))}
          />
        )}
        {primarySubject && (
          <CourseSidebarListItem
            icon={faGraduationCap}
            label="Subject"
            content={(
              <Hyperlink
                destination={primarySubject.url}
                target="_blank"
                onClick={() => {
                  sendTrackEvent('edx.learner_portal.course.sidebar.subject.clicked', {
                    subject: primarySubject.name,
                  });
                }}
              >
                {primarySubject.name}
              </Hyperlink>
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
        {transcriptLanguages?.length > 0 && (
          <CourseSidebarListItem
            icon={faFileVideo}
            label={transcriptLabel}
            content={transcriptLanguages.map(language => (
              ISO6391.getNativeName(language.slice(0, 2))
            )).join(', ')}
          />
        )}
        {pacingType && (
          <CourseSidebarListItem
            icon={faUser}
            label="Course Type"
            content={pacingTypeContent}
          />
        )}
      </ul>
      {course?.programs.length > 0 && (
        <CourseAssociatedPrograms />
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
