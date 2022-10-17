import React, { useEffect, useState } from 'react';
import { ArrowBack, ArrowForward } from '@edx/paragon/icons';
import {
  breakpoints, Container, Icon, IconButton, MediaQuery,
} from '@edx/paragon';

import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import './styles/_RecommendedCoursesCarousel.scss';

/**
 * A component to render carousel for recommended courses with passed carouselItem and carouselData.
 * @param props {carouselData} List - The carousel items data will be passed to and displayed
 *                             in carousel Item. If the List is undefined, loading state will be shown and
 *                             if the List has data, carousel items will be rendered.
 * @param props {carouselItem} React component - Item to be displayed in carousel.
 * @param props {carouselSubtitle} String - A Subtitle will be displayed if it is passed.
 * @param props {carouselTitle} String - A Title will be displayed if it is passed.
 */
const RecommendationsCarousel = (props) => {
  const {
    carouselItem: RecommendedCourseCard,
    carouselData: recommendedCourses,
    carouselTitle,
    carouselSubtitle,
  } = props;

  const [isLoading, setIsLoading] = useState(!recommendedCourses);
  const [activeCarouselItemIndex, setActiveCarouselItemIndex] = useState(0);
  const [numOfCarouselFrames, setNumOfCarouselFrames] = useState(0);
  const [shouldScrollCarousel, setShouldScrollCarousel] = useState(false);

  useEffect(() => {
    if (!recommendedCourses) {
      setIsLoading(true);
    }
    if (recommendedCourses && recommendedCourses.length > 0) {
      setIsLoading(false);
      setNumOfCarouselFrames(
        recommendedCourses && recommendedCourses.length > 3 ? recommendedCourses.length - 3 : 1,
      );
    }
  }, [recommendedCourses]);

  const moveCarousel = (direction) => {
    setShouldScrollCarousel(true);
    if (direction === 'left' && activeCarouselItemIndex > 0) {
      setActiveCarouselItemIndex(prevState => prevState - 1);
    } else if (direction === 'right' && activeCarouselItemIndex < numOfCarouselFrames) {
      setActiveCarouselItemIndex(prevState => prevState + 1);
    }
    setShouldScrollCarousel(false);
  };

  const leftArrow = () => (
    <IconButton
      disabled={activeCarouselItemIndex === 0}
      src={ArrowBack}
      iconAs={Icon}
      alt="Left"
      size="md"
      onClick={() => { moveCarousel('left'); }}
    />
  );

  const rightArrow = () => (
    <IconButton
      disabled={activeCarouselItemIndex === numOfCarouselFrames - 1}
      src={ArrowForward}
      iconAs={Icon}
      alt="Right"
      onClick={() => { moveCarousel('right'); }}
    />
  );

  const getTransformationStyles = () => ({
    transform: `translateX(-${activeCarouselItemIndex * 25}%)`,
    transition: '0.5s ease-in-out',
  });

  const displayCoursesLoadingState = () => {
    const loadingCourses = [];
    for (let i = 0; i < 4; i++) {
      loadingCourses.push(
        <div key={i} className="skeleton-course-card">
          <RecommendedCourseCard isLoading={isLoading} />
        </div>,
      );
    }
    return loadingCourses;
  };

  const getScrollClass = (screen = 'small-screen') => {
    if (screen === 'large-screen' && shouldScrollCarousel) {
      return 'overflow-auto';
    }
    if (screen === 'small-screen' && !isLoading) {
      return 'overflow-auto';
    }
    return 'overflow-hidden';
  };

  if (recommendedCourses && recommendedCourses.length === 0) { return <></>; }

  return (
    <Container size="lg" className="search-results my-5">
      <div className="d-flex">
        <div className="flex-grow-1">
          {isLoading ? (
            <>
              <Skeleton id="title-loading-skeleton" className="h2 d-block mb-3" width={240} />
              <Skeleton id="subtitle-loading-skeleton" className="lead mb-4" width={160} />
            </>
          ) : (
            <>
              <h2 className="flex-grow-1 mb-2">
                {carouselTitle}
              </h2>
              <p className="recommendations-subheading mb-3.5">{carouselSubtitle}</p>
            </>
          )}
        </div>
        <MediaQuery minWidth={breakpoints.medium.maxWidth}>
          {!isLoading && numOfCarouselFrames > 1 && (
            <div className="flex-grow-1 d-flex flex-row justify-content-end">
              <div className="align-self-center carousal-arrow-control m-3.5 mr-2.5">
                {leftArrow()}
              </div>
              <div className="align-self-center carousal-arrow-control m-3.5 ml-2.5">
                {rightArrow()}
              </div>
            </div>
          )}
        </MediaQuery>
      </div>
      <>
        <MediaQuery minWidth={breakpoints.medium.maxWidth}>
          <div className={getScrollClass('large-screen')}>
            <div
              className="d-flex flex-row flex-nowrap ais-Hits-list"
              style={getTransformationStyles()}
              data-testid="courses-carousel"
            >
              {isLoading ? (displayCoursesLoadingState()) : (recommendedCourses.map(course => (
                <div key={course.courseKey} className="ais-Hits-item">
                  <RecommendedCourseCard
                    itemData={course}
                  />
                </div>
              )))}
            </div>
          </div>
        </MediaQuery>
        <MediaQuery maxWidth={breakpoints.medium.maxWidth}>
          <div className={`no-slider d-flex flex-row flex-nowrap ${getScrollClass()}`}>
            {isLoading ? (displayCoursesLoadingState()) : (recommendedCourses.map(course => (
              <div
                key={course.courseKey}
                className={recommendedCourses.length > 1
                  ? 'skeleton-course-card skeleton-recommended-course-card pl-0 pr-4'
                  : 'skeleton-course-card pl-0 pr-0'}
              >
                <RecommendedCourseCard
                  itemData={course}
                  classes={recommendedCourses.length > 1 ? 'recommended-course-card' : ''}
                />
              </div>
            )))}
          </div>
        </MediaQuery>
      </>
    </Container>
  );
};

RecommendationsCarousel.propTypes = {
  carouselData: PropTypes.arrayOf(PropTypes.object),
  carouselItem: PropTypes.elementType.isRequired,
  carouselTitle: PropTypes.string,
  carouselSubtitle: PropTypes.string,
};

RecommendationsCarousel.defaultProps = {
  carouselData: undefined,
  carouselTitle: '',
  carouselSubtitle: '',
};

export default RecommendationsCarousel;
