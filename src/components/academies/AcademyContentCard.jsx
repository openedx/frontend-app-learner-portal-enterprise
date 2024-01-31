import React, { useEffect, useState } from 'react';
import {
  Button,
  CardGrid,
  Spinner,
} from '@edx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { LEARNING_TYPE_COURSE, LEARNING_TYPE_EXECUTIVE_EDUCATION, LEARNING_TYPE_PATHWAY } from '@edx/frontend-enterprise-catalog-search/data/constants';
import SearchCourseCard from '../search/SearchCourseCard';
import {
  EXECUTIVE_EDUCATION_SECTION, PATHWAYS_SECTION, SELF_PACED_SECTION,
} from './data/constants';
import SearchPathwayCard from '../pathway/SearchPathwayCard';

const AcademyContentCard = ({
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
          filters: `(content_type:course OR content_type:learnerpathway) AND academy_uuids:${academyUUID}`, // eslint-disable-line object-shorthand
          hitsPerPage: 100,
          page: 0,
        });
        let tagHits;
        let nbTagHits;
        if (selectedTag) {
          const response = await courseIndex.search('', {
            facetFilters: [['content_type:course', 'content_type:learnerpathway'], `academy_tags:${selectedTag}`],
          });
          ({ hits: tagHits, nbHits: nbTagHits } = response);
        }

        if (nbAcademyHits > 0) {
          let allHits;
          const academyHitsCamelCased = camelCaseObject(academyHits);
          if (nbTagHits > 0) {
            const tagHitsCamelCased = camelCaseObject(tagHits);
            allHits = contentIntersect(academyHitsCamelCased, tagHitsCamelCased);
          } else if (nbTagHits === 0) {
            allHits = [];
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
  const ocmCourses = courses.filter(course => course.learningType === LEARNING_TYPE_COURSE);
  const execEdCourses = courses.filter(course => course.learningType === LEARNING_TYPE_EXECUTIVE_EDUCATION);
  const pathways = courses.filter(course => course.learningType === LEARNING_TYPE_PATHWAY);
  const renderableContent = ({
    content,
    contentType,
    title,
    subtitle,
    additionalClass,
    titleTestId,
    subtitleTestId,
  }) => (
    content.length > 0 && (
      <div className={additionalClass}>
        <h3 data-testid={titleTestId}>{title}</h3>
        <p data-testid={subtitleTestId}>{subtitle}</p>
        <CardGrid columnSizes={{
          xs: 12, md: 6, lg: 4, xl: 3,
        }}
        >
          {contentType !== LEARNING_TYPE_PATHWAY
            ? content.map(course => (
              <SearchCourseCard
                key={`academy-course-${uuidv4()}`}
                data-testid="academy-course-card"
                hit={course}
                parentRoute={{
                  label: academyTitle,
                  to: academyURL,
                }}
              />
            ))
            : content.map(pathway => (
              <SearchPathwayCard
                key={`academy-pathway-${uuidv4()}`}
                data-testid="academy-pathways-card"
                hit={pathway}
                isAcademyPathway
              />
            ))}
        </CardGrid>
      </div>
    )
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
        {selectedTag && (
          <Button
            className="tag-clear-button"
            variant="link"
            size="sm"
            onClick={() => setSelectedTag(undefined)}
          >
            clear tag filter
          </Button>
        )}
      </div>
      {
        isAlgoliaLoading ? (
          <div className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" className="mie-3" screenReaderText="loading" />
          </div>
        ) : (
          <>
            {renderableContent({
              content: execEdCourses,
              contentType: LEARNING_TYPE_COURSE,
              title: EXECUTIVE_EDUCATION_SECTION.title,
              subtitle: EXECUTIVE_EDUCATION_SECTION.subtitle,
              additionalClass: 'academy-exec-ed-courses-container',
              titleTestId: 'academy-exec-ed-courses-title',
              subtitleTestId: 'academy-exec-ed-courses-subtitle',
            })}
            {renderableContent({
              content: ocmCourses,
              contentType: LEARNING_TYPE_EXECUTIVE_EDUCATION,
              title: SELF_PACED_SECTION.title,
              subtitle: SELF_PACED_SECTION.subtitle,
              additionalClass: 'academy-ocm-courses-container',
              titleTestId: 'academy-ocm-courses-title',
              subtitleTestId: 'academy-ocm-courses-subtitle',
            })}
            {renderableContent({
              content: pathways,
              contentType: LEARNING_TYPE_PATHWAY,
              title: PATHWAYS_SECTION.title,
              subtitle: PATHWAYS_SECTION.subtitle,
              additionalClass: 'academy-pathways-container',
              titleTestId: 'academy-pathway-title',
              subtitleTestId: 'academy-pathway-subtitle',
            })}
          </>
        )
      }
    </>
  );
};

AcademyContentCard.propTypes = {
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

export default AcademyContentCard;
