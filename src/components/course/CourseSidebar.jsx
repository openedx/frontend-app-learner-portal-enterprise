import { Link } from 'react-router-dom';
import ISO6391 from 'iso-639-1';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  AccessTime, Equalizer, Institution, Person, School, Speed, Tag, VideoFile,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
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
import { useCourseMetadata, useEnterpriseCustomer } from '../app/data';

const CourseSidebar = () => {
  const { data: courseMetadata } = useCourseMetadata();
  const { primarySubject } = processCourseSubjects(courseMetadata);
  const [partners, institutionLabel] = useCoursePartners(courseMetadata);
  const [weeksToComplete, weeksLabel] = useCourseRunWeeksToComplete(courseMetadata.activeCourseRun);
  const [transcriptLanguages, transcriptLabel] = useCourseTranscriptLanguages(courseMetadata.activeCourseRun);
  const [pacingType, pacingTypeContent] = useCoursePacingType(courseMetadata.activeCourseRun);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const intl = useIntl();
  return (
    <>
      <ul className="pl-0 mb-5 course-details-sidebar">
        {isDefinedAndNotNull(courseMetadata.activeCourseRun) && (
          <>
            {hasTruthyValue(courseMetadata.activeCourseRun.weeksToComplete) && (
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
            {hasTruthyValue([courseMetadata.activeCourseRun.minEffort, courseMetadata.activeCourseRun.maxEffort]) && (
              <CourseSidebarListItem
                icon={Speed}
                label={
                  intl.formatMessage({
                    id: 'enterprise.course.about.course.sidebar.effort',
                    defaultMessage: 'Effort',
                    description: 'Label for the effort required to complete the course. (hours per week)',
                  })
                }
                content={`${courseMetadata.activeCourseRun.minEffort}-${courseMetadata.activeCourseRun.maxEffort} hours per week`}
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
                  to={`/${enterpriseCustomer.slug}/search?partners.name=${encodeURIComponent(partner.name)}`}
                  onClick={() => {
                    sendEnterpriseTrackEvent(
                      enterpriseCustomer.uuid,
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
                to={`/${enterpriseCustomer.slug}/search?subjects=${encodeURIComponent(primarySubject.name)}`}
                onClick={() => {
                  sendEnterpriseTrackEvent(
                    enterpriseCustomer.uuid,
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
        {courseMetadata.activeCourseRun.levelType && (
          <CourseSidebarListItem
            icon={Equalizer}
            label={
              intl.formatMessage({
                id: 'enterprise.course.about.course.sidebar.level',
                defaultMessage: 'Level',
                description: 'Label for the level of the course. (Introductory, Intermediate, Advanced)',
              })
            }
            content={courseMetadata.activeCourseRun.levelType}
          />
        )}
        {courseMetadata.activeCourseRun.contentLanguage && (
          <CourseSidebarListItem
            icon={Institution}
            label={
              intl.formatMessage({
                id: 'enterprise.course.about.course.sidebar.language',
                defaultMessage: 'Language',
                description: 'Label for the language of the course. (English, Spanish, etc.)',
              })
            }
            content={ISO6391.getNativeName(courseMetadata.activeCourseRun.contentLanguage.slice(0, 2))}
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
      {enterpriseCustomer.enablePrograms && courseMetadata.programs.length > 0 && (
        <CourseAssociatedPrograms />
      )}
      {courseMetadata.prerequisitesRaw && (
        <div className="prerequisites mb-5">
          <h3>Prerequisites</h3>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: courseMetadata.prerequisitesRaw }} />
        </div>
      )}
    </>
  );
};

export default CourseSidebar;
