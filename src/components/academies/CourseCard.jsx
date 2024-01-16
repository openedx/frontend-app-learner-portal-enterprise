import React, { useEffect, useState } from 'react';
import {
  Button,
  CardGrid,
  Spinner,
} from '@edx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { LEARNING_TYPE_COURSE, LEARNING_TYPE_EXECUTIVE_EDUCATION } from '@edx/frontend-enterprise-catalog-search/data/constants';
import SearchCourseCard from '../search/SearchCourseCard';
import {
  EXECUTIVE_EDUCATION_SECTION, SELF_PACED_SECTION,
} from './data/constants';

const CourseCard = ({
  courseIndex, academyUUID, academyTitle, academyURL, tags,
}) => {
  const [isAlgoliaLoading, setIsAlgoliaLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  const [selectedTag, setSelectedTag] = useState();

  useEffect(
    () => {
      function contentIntersect(academyContent, tagContent) {
        const intersect = [];
        tagContent.forEach((content) => {
          if (academyContent.some(o => o.aggregation_key === content.aggregation_key)) {
            intersect.push(content);
          }
        });
        return intersect;
      }

      async function fetchCourses() {
        setIsAlgoliaLoading(true);

        const { hits: academyHits, nbHits: nbAcademyHits } = await courseIndex.search('', {
          filters: `content_type:course AND academy_uuids:${academyUUID}`, // eslint-disable-line object-shorthand
        });

        let tagHits;
        let nbTagHits;
        if (selectedTag) {
          const response = await courseIndex.search('', {
            facetFilters: ['content_type:course', `academy_tags:${selectedTag}`],
          });
          ({ hits: tagHits, nbHits: nbTagHits } = response);
        }

        if (nbAcademyHits > 0) {
          let allHits;
          const academyHitsCamelCased = camelCaseObject(academyHits);

          if (nbTagHits > 0) {
            const tagHitsCamelCased = camelCaseObject(tagHits);
            allHits = contentIntersect(academyHitsCamelCased, tagHitsCamelCased);
          } else {
            allHits = academyHitsCamelCased;
          }

          setCourses(allHits);
          setIsAlgoliaLoading(false);
        } else {
          setIsAlgoliaLoading(false);
        }
      }
      fetchCourses();
    },
    [courseIndex, academyUUID, selectedTag],
  );

  return (
    <>
      <div className="academy-tags mb-3">
        {tags.map(tag => (
          <Button
            className="academy-tag"
            data-testid="academy-tag"
            key={tag.id}
            variant="light"
            onClick={() => setSelectedTag(tag.title)}
          >
            {tag.title}
          </Button>
        ))}
      </div>

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
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      content_metadata: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  ).isRequired,
};

export default CourseCard;
