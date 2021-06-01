import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import { useLocation } from 'react-router-dom';
import qs from 'query-string';
import { Breadcrumb, Container, StatusAlert } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { CourseContext } from './CourseContextProvider';
import CourseRunSelector from './CourseRunSelector';
import CourseSkills from './CourseSkills';
import EnrollButton from './EnrollButton';

import { ENROLLMENT_FAILED_QUERY_PARAM } from './data/constants';
import {
  isArchived,
  getDefaultProgram,
  formatProgramType,
} from './data/utils';
import { useCourseSubjects, useCoursePartners } from './data/hooks';
import { useRenderContactHelpText } from '../../utils/hooks';

export default function CourseHeader() {
  const { state } = useContext(CourseContext);
  const { course, activeCourseRun, catalog } = state;
  const { enterpriseConfig } = useContext(AppContext);
  const { primarySubject } = useCourseSubjects(course);
  const [partners] = useCoursePartners(course);
  const renderContactHelpText = useRenderContactHelpText(enterpriseConfig);
  const { search } = useLocation();

  const enrollmentFailed = useMemo(
    () => qs.parse(search)[ENROLLMENT_FAILED_QUERY_PARAM],
    [search],
  );

  const defaultProgram = useMemo(
    () => getDefaultProgram(course.programs),
    [course],
  );

  const renderFailedEnrollmentAlert = () => (
    <>
      <Container size="lg" className="pt-3">
        <StatusAlert
          alertType="danger"
          className="mb-0"
          dialog={(
            <>
              You were not enrolled in your selected course.
              In order to enroll, you must accept the data sharing consent terms.
              Please {renderContactHelpText()} for further information.
            </>
          )}
          dismissible={false}
          open
        />
      </Container>
    </>
  );

  return (
    <div className="course-header">
      {enrollmentFailed && renderFailedEnrollmentAlert()}
      <Container size="lg">
        <div className="row py-4">
          <div className="col-12 col-lg-7">
            {primarySubject && (
              <div className="small">
                <Breadcrumb
                  links={[
                    {
                      label: 'Find a Course',
                      url: `/${enterpriseConfig.slug}/search`,
                    },
                  ]}
                  activeLabel={course.title}
                />
              </div>
            )}
            {partners.length > 0 && (
              <div className="mt-4 mb-2">
                {partners.map(partner => (
                  <a
                    className="d-inline-block mr-4"
                    href={partner.marketingUrl}
                    key={partner.uuid}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={partner.logoImageUrl}
                      alt={`${partner.name} logo`}
                      style={{ maxWidth: 160, maxHeight: 144 }}
                    />
                  </a>
                ))}
              </div>
            )}
            <div className={classNames({ 'mb-4': !course.shortDescription })}>
              <h2>{course.title}</h2>
            </div>
            {course.shortDescription && (
              <div
                className="lead font-weight-normal mb-4"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: course.shortDescription }}
              />
            )}
            {course.skills?.length > 0 && <CourseSkills />}
            {catalog.containsContentItems ? (
              <>
                <CourseRunSelector />
                {isArchived(activeCourseRun) && (
                  <p className="font-weight-bold">
                    Archived: Future Dates To Be Announced
                  </p>
                )}
                <EnrollButton />
                {defaultProgram && (
                  <p className="font-weight-bold mt-3 mb-0">
                    This course is part of a {formatProgramType(defaultProgram.type)}.
                  </p>
                )}
              </>
            ) : (
              <p className="font-weight-bold mt-3 mb-0">
                This course is not part of your company&apos;s curated course catalog.
              </p>
            )}
          </div>
          {course.image?.src && (
            <div className="col-12 col-lg-4 offset-lg-1 mt-3 mt-lg-0">
              <img src={course.image.src} alt="course preview" className="w-100" />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
