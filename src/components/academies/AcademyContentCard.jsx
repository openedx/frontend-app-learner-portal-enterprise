import React, { useEffect, useState } from 'react';
import {
  Button,
  CardGrid,
  Spinner,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { LEARNING_TYPE_COURSE, LEARNING_TYPE_EXECUTIVE_EDUCATION } from '@edx/frontend-enterprise-catalog-search/data/constants';
import SearchCourseCard from '../search/SearchCourseCard';
import { useEnterpriseCustomer } from '../app/data';

const AcademyContentCard = ({
  courseIndex, academyUUID, academyTitle, academyURL, tags,
}) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const [isAlgoliaLoading, setIsAlgoliaLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [showAllExecEdCourses, setShowAllExecEdCourses] = useState(false);
  const [showAllOcmCourses, setShowAllOcmCourses] = useState(false);

  const [selectedTag, setSelectedTag] = useState();
  const intl = useIntl();
  const ocmCourses = [];
  const execEdCourses = [];
  const maxCoursesToShow = 4;

  useEffect(
    () => {
      async function fetchCourses() {
        setIsAlgoliaLoading(true);
        const searchFacetFilters = selectedTag ? [
          ['content_type:course', 'content_type:learnerpathway'],
          `academy_uuids:${academyUUID}`,
          `enterprise_customer_uuids:${enterpriseCustomer.uuid}`,
          `academy_tags:${selectedTag}`,
        ] : [
          ['content_type:course', 'content_type:learnerpathway'],
          `academy_uuids:${academyUUID}`,
          `enterprise_customer_uuids:${enterpriseCustomer.uuid}`,
        ];
        const { hits, nbHits } = await courseIndex.search('', {
          facetFilters: searchFacetFilters,
          hitsPerPage: 100,
          page: 0,
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
    [courseIndex, academyUUID, selectedTag, enterpriseCustomer],
  );

  courses.forEach(course => {
    if (course.learningType === LEARNING_TYPE_COURSE) {
      ocmCourses.push(course);
    } else if (course.learningType === LEARNING_TYPE_EXECUTIVE_EDUCATION) {
      execEdCourses.push(course);
    }
  });

  const toggleShowMore = (contentType) => () => {
    if (contentType === LEARNING_TYPE_EXECUTIVE_EDUCATION) {
      setShowAllExecEdCourses(prevState => !prevState);
    } else {
      setShowAllOcmCourses(prevState => !prevState);
    }
  };
  const visibleExecEdCourses = showAllExecEdCourses
    ? execEdCourses
    : execEdCourses.slice(0, maxCoursesToShow);

  const visibleOcmCourses = showAllOcmCourses
    ? ocmCourses
    : ocmCourses.slice(0, maxCoursesToShow);

  const showMoreButton = (contentType) => {
    if (contentType === LEARNING_TYPE_EXECUTIVE_EDUCATION) {
      return showAllExecEdCourses;
    }
    return showAllOcmCourses;
  };

  const toggleButtonText = (showMoreBtnEnabled, contentType, title, contentLength) => {
    let defaultMessage;

    if (showMoreBtnEnabled) {
      defaultMessage = title === 'Self-paced courses'
        ? '< Show less {title}'
        : '< Show less {title} courses';
    } else {
      defaultMessage = title === 'Self-paced courses'
        ? 'Show more {title} ({contentLength}) >'
        : 'Show more {title} courses ({contentLength}) >';
    }

    return intl.formatMessage({
      id: 'academy.detail.page.show.more.toggle.button.text',
      defaultMessage,
      description: 'Text for the show more/show less toggle button on academy detail page.',
    }, { title, contentLength });
  };

  const renderableContent = ({
    content,
    contentLength,
    contentType,
    title,
    subtitle,
    additionalClass,
    titleTestId,
    subtitleTestId,
  }) => {
    if (contentLength <= 0) {
      return null;
    }

    return (
      <div className={additionalClass}>
        <div className="d-flex flex-row align-items-center justify-content-between mt-5">
          <h3 data-testid={titleTestId} className="font-weight-normal">{title}</h3>
          {contentLength > 4 && (
            <Button
              className=""
              variant="link"
              size="xl"
              onClick={toggleShowMore(contentType)}
            >
              { toggleButtonText(showMoreButton(contentType), contentType, title, contentLength) }
            </Button>
          )}
        </div>
        <p data-testid={subtitleTestId}>{subtitle}</p>
        <CardGrid columnSizes={{
          xs: 12, md: 6, lg: 4, xl: 3,
        }}
        >
          {content?.map(course => (
            <SearchCourseCard
              key={`academy-course-${uuidv4()}`}
              data-testid="academy-course-card"
              hit={course}
              parentRoute={{
                label: academyTitle,
                to: academyURL,
              }}
            />
          ))}
        </CardGrid>
      </div>
    );
  };

  const clearTag = () => {
    setSelectedTag(undefined);
    setShowAllExecEdCourses(false);
    setShowAllOcmCourses(false);
  };
  return (
    <>
      <div className="academy-tags">
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
            onClick={() => clearTag()}
          >
            <FormattedMessage
              id="academy.detail.page.clear.tag.filter.button"
              defaultMessage="clear tag filter"
              description="Label for the clear tag filter button on the academy detail page"
            />
          </Button>
        )}
      </div>
      {
        isAlgoliaLoading ? (
          <div className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" className="mie-3 m-3" screenReaderText="loading" />
          </div>
        ) : (
          <>
            {renderableContent({
              content: visibleExecEdCourses,
              contentLength: execEdCourses?.length,
              contentType: LEARNING_TYPE_EXECUTIVE_EDUCATION,
              title: intl.formatMessage({
                id: 'academy.detail.page.executive.education.courses.section.title',
                defaultMessage: 'Executive Education',
                description: 'Title for the executive education courses section on the academy detail page.',
              }),
              subtitle: intl.formatMessage({
                id: 'academy.detail.page.executive.education.courses.section.subtitle',
                defaultMessage: 'A selection of high-impact graduate-level courses that follow a structured schedule and include active interaction with educators and peers.',
                description: 'Subtitle for the executive education courses section on the academy detail page.',
              }),
              additionalClass: 'academy-exec-ed-courses-container',
              titleTestId: 'academy-exec-ed-courses-title',
              subtitleTestId: 'academy-exec-ed-courses-subtitle',
            })}
            {renderableContent({
              content: visibleOcmCourses,
              contentLength: ocmCourses?.length,
              contentType: LEARNING_TYPE_COURSE,
              title: intl.formatMessage({
                id: 'academy.detail.page.self.paced.courses.section.title',
                defaultMessage: 'Self-paced courses',
                description: 'Title for the self-paced courses section on the academy detail page.',
              }),
              subtitle: intl.formatMessage({
                id: 'academy.detail.page.self.paced.courses.section.subtitle',
                defaultMessage: 'A collection of courses that cover essential knowledge on the subject. These courses offer flexible schedules and independent study.',
                description: 'Subtitle for the self-paced courses section on the academy detail page.',
              }),
              additionalClass: 'academy-ocm-courses-container',
              titleTestId: 'academy-ocm-courses-title',
              subtitleTestId: 'academy-ocm-courses-subtitle',
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
