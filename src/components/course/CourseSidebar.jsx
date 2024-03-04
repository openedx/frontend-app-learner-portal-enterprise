import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import ISO6391 from 'iso-639-1';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  AccessTime, Equalizer, Institution, Person, School, Speed, Tag, VideoFile,
} from '@openedx/paragon/icons';
import { AppContext } from '@edx/frontend-platform/react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { CourseContext } from './CourseContextProvider';
import CourseSidebarListItem from './CourseSidebarListItem';
import CourseAssociatedPrograms from './CourseAssociatedPrograms';
import CourseSidebarPrice from './CourseSidebarPrice';

import { isDefinedAndNotNull, hasTruthyValue } from '../../utils/common';
import {
  useCoursePartners,
  useCourseRunWeeksToComplete,
  useCourseTranscriptLanguages,
  useCoursePacingType,
} from './data/hooks';
import { processCourseSubjects } from './data/utils';

const CourseSidebar = () => {
  const { state } = useContext(CourseContext);
  const { course, activeCourseRun } = state;
  const { primarySubject } = processCourseSubjects(course);
  const [partners, institutionLabel] = useCoursePartners(course);
  const [weeksToComplete, weeksLabel] = useCourseRunWeeksToComplete(activeCourseRun);
  const [transcriptLanguages, transcriptLabel] = useCourseTranscriptLanguages(activeCourseRun);
  const [pacingType, pacingTypeContent] = useCoursePacingType(activeCourseRun);
  const { enterpriseConfig } = useContext(AppContext);
  const intl = useIntl();
  return (
    <>
      <ul className="pl-0 mb-5 course-details-sidebar">
        {isDefinedAndNotNull(activeCourseRun) && (
          <>
            {hasTruthyValue(activeCourseRun.weeksToComplete) && (
              <CourseSidebarListItem
                icon={AccessTime}
                label={
                  intl.formatMessage({
                    id: 'enterprise.course.about.course.sidebar.length',
                    defaultMessage: 'Length',
                    description: 'Label for the length of the course in weeks.',
                  })
                }
                content={`${weeksToComplete} ${weeksLabel}`}
              />
            )}
            {hasTruthyValue([activeCourseRun.minEffort, activeCourseRun.maxEffort]) && (
              <CourseSidebarListItem
                icon={Speed}
                label={
                  intl.formatMessage({
                    id: 'enterprise.course.about.course.sidebar.effort',
                    defaultMessage: 'Effort',
                    description: 'Label for the effort required to complete the course. (hours per week)',
                  })
                }
                content={`${activeCourseRun.minEffort}-${activeCourseRun.maxEffort} hours per week`}
              />
            )}
          </>
        )}
        <CourseSidebarListItem
          icon={Tag}
          label={
            intl.formatMessage({
              id: 'enterprise.course.about.course.sidebar.price',
              defaultMessage: 'Price',
              description: 'Label for the price of the course. Price will be in USD.',
            })
          }
          content={<CourseSidebarPrice />}
        />
        {partners?.length > 0 && (
          <CourseSidebarListItem
            icon={Institution}
            label={institutionLabel}
            content={partners.map(partner => (
              <span key={partner.key} className="d-block">
                <Link
                  to={`/${enterpriseConfig.slug}/search?partners.name=${encodeURIComponent(partner.name)}`}
                  onClick={() => {
                    sendEnterpriseTrackEvent(
                      enterpriseConfig.uuid,
                      'edx.ui.enterprise.learner_portal.course.sidebar.partner.clicked',
                      {
                        partner_name: partner.key,
                      },
                    );
                  }}
                >
                  {partner.key}
                </Link>
              </span>
            ))}
          />
        )}
        {primarySubject && (
          <CourseSidebarListItem
            icon={School}
            label={
              intl.formatMessage({
                id: 'enterprise.course.about.course.sidebar.subject',
                defaultMessage: 'Subject',
                description: 'Label for the subject of the course.',
              })
            }
            content={(
              <Link
                to={`/${enterpriseConfig.slug}/search?subjects=${encodeURIComponent(primarySubject.name)}`}
                onClick={() => {
                  sendEnterpriseTrackEvent(
                    enterpriseConfig.uuid,
                    'edx.ui.enterprise.learner_portal.course.sidebar.subject.clicked',
                    {
                      subject: primarySubject.name,
                    },
                  );
                }}
              >
                {primarySubject.name}
              </Link>
            )}
          />
        )}
        {activeCourseRun.levelType && (
          <CourseSidebarListItem
            icon={Equalizer}
            label={
              intl.formatMessage({
                id: 'enterprise.course.about.course.sidebar.level',
                defaultMessage: 'Level',
                description: 'Label for the level of the course. (Introductory, Intermediate, Advanced)',
              })
            }
            content={activeCourseRun.levelType}
          />
        )}
        {activeCourseRun.contentLanguage && (
          <CourseSidebarListItem
            icon={Institution}
            label={
              intl.formatMessage({
                id: 'enterprise.course.about.course.sidebar.language',
                defaultMessage: 'Language',
                description: 'Label for the language of the course. (English, Spanish, etc.)',
              })
            }
            content={ISO6391.getNativeName(activeCourseRun.contentLanguage.slice(0, 2))}
          />
        )}
        {transcriptLanguages?.length > 0 && (
          <CourseSidebarListItem
            icon={VideoFile}
            label={transcriptLabel}
            content={transcriptLanguages.map(language => (
              ISO6391.getNativeName(language.slice(0, 2))
            )).join(', ')}
          />
        )}
        {pacingType && (
          <CourseSidebarListItem
            icon={Person}
            label={
              intl.formatMessage({
                id: 'enterprise.course.about.course.sidebar.course.type',
                defaultMessage: 'Course Type',
                description: 'Label for the course type. (Self-paced, Instructor-paced, etc.)',
              })
            }
            content={pacingTypeContent}
          />
        )}
      </ul>
      {enterpriseConfig.enablePrograms && course?.programs.length > 0 && (
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
};

export default CourseSidebar;
