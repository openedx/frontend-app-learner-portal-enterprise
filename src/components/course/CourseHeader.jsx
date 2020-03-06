import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Breadcrumb } from '@edx/paragon';

import { CourseContext } from './CourseContextProvider';
import EnrollButton from './EnrollButton';

import { useCourseSubjects, useCoursePartners } from './data/hooks';

import './styles/CourseHeader.scss';

export default function CourseHeader({
  isCourseInCatalog,
}) {
  const { state } = useContext(CourseContext);
  const { course } = state;
  const [, primarySubject] = useCourseSubjects(course);
  const [partners] = useCoursePartners(course);

  return (
    <div className="course-header">
      <div className="container-fluid">
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
            {isCourseInCatalog ? (
              <EnrollButton />
            ) : (
              <p className="font-weight-bold">
                This course is not part of your company&apos;s curated course catalog.
              </p>
            )}
          </div>
          {course.image && course.image.src && (
            <div className="col-8 col-lg-4 offset-lg-1 mt-3 mt-lg-0">
              <img src={course.image.src} alt="course preview" className="w-100" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

CourseHeader.propTypes = {
  isCourseInCatalog: PropTypes.bool.isRequired,
};
