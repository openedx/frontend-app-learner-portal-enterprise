import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Card } from '@edx/paragon';

import { isDefinedAndNotNull } from '../../utils/common';

const SearchCourseCard = ({ hit, isLoading }) => {
  const { enterpriseConfig: { slug } } = useContext(AppContext);

  const course = useMemo(
    () => {
      if (!hit) {
        return {};
      }
      return camelCaseObject(hit);
    },
    [hit],
  );

  const linkToCourse = useMemo(
    () => {
      if (!Object.keys(course).length) {
        return '#';
      }
      return `/${slug}/course/${course.key}`;
    },
    [isLoading, course],
  );

  const partnerDetails = useMemo(
    () => {
      if (!Object.keys(course).length || !isDefinedAndNotNull(course.partners)) {
        return {};
      }

      return {
        primaryPartner: course.partners.length > 0 ? course.partners[0] : undefined,
        showPartnerLogo: course.partners.length === 1,
      };
    },
    [course],
  );

  return (
    <div
      className="search-course-card mb-4"
      role="group"
      aria-label={course.title}
    >
      <Link to={linkToCourse}>
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
              src={course.cardImageUrl}
              alt=""
            />
          )}
          {isLoading && (
            <div className="partner-logo-wrapper">
              <Skeleton width={90} height={42} data-testid="partner-logo-loading" />
            </div>
          )}
          {(!isLoading && partnerDetails.primaryPartner && partnerDetails.showPartnerLogo) && (
            <div className="partner-logo-wrapper">
              <img
                src={partnerDetails.primaryPartner.logoImageUrl}
                className="partner-logo"
                alt={partnerDetails.primaryPartner.name}
              />
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
              <Skeleton duration={0} data-testid="partner-name-loading" />
            ) : (
              <>
                {course.partners.length > 0 && (
                  <p className="partner text-muted m-0">
                    <Truncate lines={1} trimWhitespace>
                      {course.partners.map(partner => partner.name).join(', ')}
                    </Truncate>
                  </p>
                )}
              </>
            )}
          </Card.Body>
          <Card.Footer className="bg-white border-0 pt-0 pb-2">
            {isLoading ? (
              <Skeleton duration={0} data-testid="content-type-loading" />
            ) : (
              <span className="text-muted">Course</span>
            )}
          </Card.Footer>
        </Card>
      </Link>
    </div>
  );
};

const SkeletonCourseCard = (props) => (
  <SearchCourseCard {...props} isLoading />
);

SearchCourseCard.Skeleton = SkeletonCourseCard;

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

export default SearchCourseCard;
