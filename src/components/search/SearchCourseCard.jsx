import React from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import Skeleton from 'react-loading-skeleton';
// import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Card } from '@edx/paragon';

import { VscGlobe } from 'react-icons/vsc';
import { RiAlarmLine } from 'react-icons/ri';

const SearchCourseCard = ({ hit, isLoading }) => {
  // const { enterpriseConfig: { slug, uuid } } = useContext(AppContext);

  const course = hit ? camelCaseObject(hit) : {};

  return (
    <div
      className="search-course-card mb-4"
      role="group"
      aria-label={course.title}
    >
      <Card>
        {isLoading ? (
          <Card.Img
            as={Skeleton}
            variant="top"
            duration={0}
            height={100}
            data-testid="card-img-loading"
          />
        ) : (
          <Card.Img
            variant="top"
            src={course.cardImage}
            alt=""
          />
        )}
        {isLoading && (
          <div className="partner-logo-wrapper">
            <Skeleton width={90} height={42} data-testid="partner-logo-loading" />
          </div>
        )}
        <Card.Body>
          <Card.Title as="h4" className="card-title mb-1">
            {isLoading ? (
              <Skeleton count={2} data-testid="course-title-loading" />
            ) : (
              <Truncate lines={3} trimWhitespace>
                {course.title}
              </Truncate>
            )}
          </Card.Title>
          {isLoading ? (
            <Skeleton duration={0} data-testid="course-info-loading" />
          ) : (
            <div className="row pt-2">
              <div className="col-6 d-flex justify-content-start">
                <span>
                  <VscGlobe /> {course.primaryLanguage}
                </span>
              </div>
              <div className="col-6 d-flex justify-content-end">
                <span>
                  <RiAlarmLine /> {course.hoursRequired}h
                </span>
              </div>
            </div>
          )}
        </Card.Body>
        <Card.Footer className="bg-white border-0 pt-0 pb-2">
          <div className="row pt-2">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a href="#" className="btn btn-outline-secondary btn-md active btn-block" role="button" aria-pressed="true">View details</a>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

const SkeletonCourseCard = (props) => (
  <SearchCourseCard {...props} isLoading />
);

SearchCourseCard.propTypes = {
  hit: PropTypes.shape({
    key: PropTypes.string,
    title: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};

SearchCourseCard.defaultProps = {
  hit: undefined,
  isLoading: false,
};

SearchCourseCard.Skeleton = SkeletonCourseCard;

export default SearchCourseCard;
