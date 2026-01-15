import { useEffect, useState } from 'react';
import { Button, CardGrid, Spinner } from '@openedx/paragon';
import { defineMessages, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import {
  LEARNING_TYPE_COURSE,
  LEARNING_TYPE_EXECUTIVE_EDUCATION,
} from '@edx/frontend-enterprise-catalog-search/data/constants';
import { getSupportedLocale } from '../app/data/utils';
import SearchCourseCard from '../search/SearchCourseCard';
import { useAlgoliaSearch, useEnterpriseCustomer } from '../app/data';
import { SearchUnavailableAlert } from '../search-unavailable-alert';

const messages = defineMessages({
  showMore: {
    id: 'academy.detail.page.show.more.selfpaced',
    defaultMessage: 'Show more Self-paced courses ({contentLength}) >',
    description: 'Show more button for self-paced courses section on academy detail page',
  },
  showLess: {
    id: 'academy.detail.page.show.less.selfpaced',
    defaultMessage: '< Show less Self-paced courses',
    description: 'Show less button for self-paced courses section on academy detail page',
  },
});

const AcademyContentCard = ({
  academyUUID, academyTitle, academyURL, tags,
}) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const [isAlgoliaLoading, setIsAlgoliaLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [showAllOcmCourses, setShowAllOcmCourses] = useState(false);

  const {
    searchClient,
    searchIndex: courseIndex,
    shouldUseSecuredAlgoliaApiKey,
  } = useAlgoliaSearch();

  const [selectedTag, setSelectedTag] = useState();
  const intl = useIntl();
  const ocmCourses = [];
  const execEdCourses = [];
  const maxCoursesToShow = 4;

  useEffect(
    () => {
      async function fetchCourses() {
        setIsAlgoliaLoading(true);
        const currentLocale = getSupportedLocale();
        const searchFacetFilters = selectedTag ? [
          ['content_type:course'],
          `academy_uuids:${academyUUID}`,
          `academy_tags:${selectedTag}`,
          `metadata_language:${currentLocale}`,
        ] : [
          ['content_type:course'],
          `academy_uuids:${academyUUID}`,
          `metadata_language:${currentLocale}`,
        ];
        if (!shouldUseSecuredAlgoliaApiKey) {
          searchFacetFilters.push(`enterprise_customer_uuids:${enterpriseCustomer.uuid}`);
        }
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
    [
      courseIndex,
      academyUUID,
      selectedTag,
      enterpriseCustomer,
      shouldUseSecuredAlgoliaApiKey,
    ],
  );

  courses.forEach(course => {
    if (course.learningType === LEARNING_TYPE_COURSE) {
      ocmCourses.push(course);
    } else if (course.learningType === LEARNING_TYPE_EXECUTIVE_EDUCATION) {
      execEdCourses.push(course);
    }
  });

  const visibleOcmCourses = showAllOcmCourses
    ? ocmCourses
    : ocmCourses.slice(0, maxCoursesToShow);

  const toggleButtonText = (showMoreBtnEnabled, contentLength) => intl.formatMessage(
    showMoreBtnEnabled ? messages.showLess : messages.showMore,
    { contentLength },
  );

  const renderableContent = ({
    content,
    contentLength,
    title,
    subtitle,
    additionalClass,
    titleTestId,
    subtitleTestId,
  }) => {
    if (contentLength <= 0) {
      return null;
    }

    if (!searchClient) {
      return <SearchUnavailableAlert />;
    }

    return (
      <div className={additionalClass}>
        <div className="d-flex flex-row align-items-center justify-content-between mt-5">
          <h3 data-testid={titleTestId} className="font-weight-normal m-0">{title}</h3>
          {contentLength > 4 && (
            <Button
              variant="link"
              size="xl"
              onClick={() => setShowAllOcmCourses(prevState => !prevState)}
            >
              { toggleButtonText(showAllOcmCourses, contentLength) }
            </Button>
          )}
        </div>
        <p data-testid={subtitleTestId} className="mt-3">{subtitle}</p>
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
            onClick={() => setSelectedTag(tag.titleEn)}
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
              content: visibleOcmCourses,
              contentLength: ocmCourses?.length,
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
