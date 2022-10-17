import React from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { Card } from '@edx/paragon';

/**
 * A component to be rendered in carousel as carouselItem. The component should be able to render carousel item
 * loading state if isLoading prop is passed as true.
 * @param props {classes} string - Custom classes to be applied to carouselItem based on number of items
 * @param props {isLoading} Bool - If isLoading is true, the component will render loading state else actual state.
 * @param props {itemData} Object - Single item data from the carouselData list. Passed from carousel.
 */
const RecommendedCourseCard = (props) => {
  const {
    itemData: course,
    isLoading,
    classes,
  } = props;
  const loadingCard = () => (
    <Card>
      <Card.ImageCap
        as={Skeleton}
        duration={0}
      />

      <Card.Header
        title={
          <Skeleton duration={0} data-testid="course-title-loading" />
        }
      />

      <Card.Section>
        <Skeleton duration={0} data-testid="partner-name-loading" />
      </Card.Section>

      <Card.Footer className="bg-white border-0 pt-0 pb-2">
        <Skeleton duration={0} data-testid="content-type-loading" />
      </Card.Footer>

    </Card>
  );

  const courseCard = () => (
    <Card
      isClickable
      className="h-100"
    >
      <Card.ImageCap
        className="h-100"
        src={course.cardImageUrl}
        srcAlt=""
        logoSrc={course.partnerImageUrl}
        logoAlt="partner-logo"
      />

      <Card.Header
        className="h-100"
        title={(
          <Truncate lines={3} trimWhitespace>
            {course.title}
          </Truncate>
        )}
      />

      <Card.Section className="py-3">
        <>
          {course.partners?.length > 0 && (
            <p className="partner text-muted m-0">
              <Truncate lines={1} trimWhitespace>
                {course.partners.map(partner => partner.name).join(', ')}
              </Truncate>
            </p>
          )}
        </>
      </Card.Section>

      <Card.Footer textElement={<span className="text-muted">Course</span>}>
        <></>
      </Card.Footer>

    </Card>
  );

  if (isLoading) {
    return (
      <div
        className={`search-course-card mb-4 h-100 ${classes}`}
        role="group"
        data-testid="loading-carousel-item"
        aria-label="card-loading-state"
      >
        {loadingCard()}
      </div>
    );
  }
  return (
    <div
      className={`search-course-card mb-4 h-100 ${classes}`}
      role="group"
      aria-label={course.title}
    >
      <Link
        className="h-100"
        to={course.marketingUrl}
        target="_blank"
      >
        {courseCard()}
      </Link>
    </div>
  );
};

RecommendedCourseCard.propTypes = {
  itemData: PropTypes.shape({
    courseKey: PropTypes.string,
    title: PropTypes.string,
    cardImageUrl: PropTypes.string,
    marketingUrl: PropTypes.string,
    partnerImageUrl: PropTypes.string,
    partners: PropTypes.array,
  }),
  isLoading: PropTypes.bool,
  classes: PropTypes.string,
};

RecommendedCourseCard.defaultProps = {
  itemData: null,
  isLoading: false,
  classes: '',
};

export default RecommendedCourseCard;
