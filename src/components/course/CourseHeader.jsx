import React, { useContext } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { Breadcrumb, Button } from '@edx/paragon';

import CourseContext from './CourseContext';

import { useCourseSubjects, useCoursePartners } from './data/hooks';

export default function CourseHeader() {
  const { course, activeCourseRun } = useContext(CourseContext);
  const { primarySubject } = useCourseSubjects(course);
  const [partners] = useCoursePartners(course);

  return (
    <div className="container" style={{ boxShadow: '0 8px 16px 0 rgba(0,0,0,.15)' }}>
      <div className="row py-4">
        <div className="col-12 col-lg-7">
          {primarySubject && (
            <Breadcrumb
              links={[
                { label: 'Catalog', url: process.env.CATALOG_BASE_URL },
                {
                  label: primarySubject.name,
                  url: primarySubject.url,
                },
              ]}
              spacer={<span>/</span>}
            />
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
          {partners.length > 0 && (
            <div className="mb-4">
              {partners.map(partner => (
                <a
                  className="d-inline-block mr-4"
                  href={partner.fullUrl}
                  key={partner.key}
                >
                  <img
                    src={partner.logoImageUrl}
                    alt={`${partner.name} logo`}
                    style={{ maxWidth: 160 }}
                  />
                </a>
              ))}
            </div>
          )}
          <div className="enroll mb-3" style={{ width: 270 }}>
            <Button className="btn-success btn-block rounded-0 py-2">
              <span className="d-block font-weight-bold mb-1">Enroll</span>
              <small className="d-block">
                Started {moment(activeCourseRun.start).format('MMM D, YYYY')}
              </small>
            </Button>
          </div>
        </div>
        {course.image && course.image.src && (
          <div className="col-8 col-lg-4 offset-lg-1 mt-3 mt-lg-0">
            <img src={course.image.src} alt="course preview" className="w-100" />
          </div>
        )}
      </div>
    </div>
  );
}
