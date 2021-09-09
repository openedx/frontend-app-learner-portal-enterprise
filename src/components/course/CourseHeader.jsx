import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import {
  Breadcrumb,
  Container,
  Row,
  Col,
} from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { CourseContext } from './CourseContextProvider';
import CourseRunSelector from './CourseRunSelector';
import CourseSkills from './CourseSkills';
import EnrollButton from './EnrollButton';
import CourseEnrollmentFailedAlert from './CourseEnrollmentFailedAlert';

import {
  isArchived,
  getDefaultProgram,
  formatProgramType,
} from './data/utils';
import {
  useCourseSubjects,
  useCoursePartners,
} from './data/hooks';

export default function CourseHeader() {
  const { state } = useContext(CourseContext);
  const { course, activeCourseRun, catalog } = state;
  const { enterpriseConfig } = useContext(AppContext);
  const { primarySubject } = useCourseSubjects(course);
  const [partners] = useCoursePartners(course);

  const defaultProgram = useMemo(
    () => getDefaultProgram(course.programs),
    [course],
  );

  return (
    <div className="course-header">
      <CourseEnrollmentFailedAlert />
      <Container size="lg">
        <Row className="py-4">
          <Col xs={12} lg={7}>
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
          </Col>
          {course.image?.src && (
            <Col xs={12} lg={{ span: 4, offset: 1 }} className="mt-3 mt-lg-0">
              <img src={course.image.src} alt="course preview" className="w-100" />
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
}
