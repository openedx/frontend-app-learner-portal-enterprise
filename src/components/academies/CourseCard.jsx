import React, { useEffect, useState } from 'react';
import { CardGrid, Spinner } from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { LEARNING_TYPE_COURSE, LEARNING_TYPE_EXECUTIVE_EDUCATION } from '@edx/frontend-enterprise-catalog-search/data/constants';
import SearchCourseCard from '../search/SearchCourseCard';
import {
  EXECUTIVE_EDUCATION_SECTION, SELF_PACED_SECTION,
} from './data/constants';

const CourseCard = ({
  courseIndex, academyUUID, academyTitle, academyURL,
}) => {
  const [isAlgoliaLoading, setIsAlgoliaLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(
    () => {
      async function fetchCourses() {
        setIsAlgoliaLoading(true);

        const { hits, nbHits } = await courseIndex.search('', {
          filters: `content_type:course AND academy_uuids:${academyUUID}`, // eslint-disable-line object-shorthand
        });

        if (nbHits > 0) {
          const hitsCamelCased = camelCaseObject(hits);
          setCourses(hitsCamelCased);
          setIsAlgoliaLoading(false);
        } else {
          setIsAlgoliaLoading(false);
        }
      }
      fetchCourses();
    },
    [courseIndex, academyUUID],
  );

  return (
    <>
      <div className="academy-exec-ed-courses-container my-4">
        <h3 data-testid="academy-exec-ed-courses-title">{EXECUTIVE_EDUCATION_SECTION.title}</h3>
        <p data-testid="academy-exec-ed-courses-subtitle">{EXECUTIVE_EDUCATION_SECTION.subtitle}</p>
        {isAlgoliaLoading
          ? (
            <div className="d-flex justify-content-center align-items-center">
              <Spinner animation="border" className="mie-3" screenReaderText="loading" />
            </div>
          )
          : (
            <CardGrid columnSizes={{
              xs: 12, md: 6, lg: 4, xl: 3,
            }}
            >
              {courses.filter(course => course.learningType === LEARNING_TYPE_EXECUTIVE_EDUCATION).map(course => (
                <SearchCourseCard
                  key={`academy-exec-ed-course-${uuidv4()}`}
                  data-testid="academy-exec-ed-course-card"
                  hit={course}
                  parentRoute={{
                    label: academyTitle,
                    to: academyURL,
                  }}
                />
              ))}
            </CardGrid>
          )}
      </div>

      <div className="academy-ocm-courses-container">
        <h3 data-testid="academy-ocm-courses-title">{SELF_PACED_SECTION.title}</h3>
        <p data-testid="academy-ocm-courses-subtitle">{SELF_PACED_SECTION.subtitle}</p>
        {isAlgoliaLoading
          ? (
            <div className="d-flex justify-content-center align-items-center">
              <Spinner animation="border" className="mie-3" screenReaderText="loading" />
            </div>
          )
          : (
            <CardGrid columnSizes={{
              xs: 12, md: 6, lg: 4, xl: 3,
            }}
            >
              {courses.filter(course => course.learningType === LEARNING_TYPE_COURSE).map(course => (
                <SearchCourseCard
                  key={`academy-ocm-course-${uuidv4()}`}
                  data-testid="academy-ocm-course-card"
                  hit={course}
                  parentRoute={{
                    label: academyTitle,
                    to: academyURL,
                  }}
                />
              ))}
            </CardGrid>
          )}
      </div>
    </>
  );
};

CourseCard.propTypes = {
  courseIndex: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
  academyUUID: PropTypes.string.isRequired,
  academyTitle: PropTypes.string.isRequired,
  academyURL: PropTypes.string.isRequired,
};

export default CourseCard;
