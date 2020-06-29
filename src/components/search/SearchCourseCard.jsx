import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import './styles/SearchCourseCard.scss';

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
      if (!Object.keys(course).length) {
        return {};
      }

      return {
        primaryPartner: course.partners.length > 0 ? course.partners[0] : undefined,
        showPartnerLogo: course.partners.length === 1,
      };
    },
    [course],
  );

  // FIXME: temporarily using the course image for "How to Learn Online" until Algolia is
  // aware of the correct course card images to be using.
  const temporaryDefaultCardImage = 'https://prod-discovery.edx-cdn.org/media/course/image/0e575a39-da1e-4e33-bb3b-e96cc6ffc58e-8372a9a276c1.png';

  return (
    <div
      className="discovery-card mb-4"
      role="group"
      aria-label={course.title}
    >
      <Link to={linkToCourse}>
        <div className="card">
          {isLoading ? (
            <Skeleton
              className="card-img-top"
              duration={0}
              height={100}
            />
          ) : (
            <img
              className="card-img-top"
              src={course.cardImageUrl || temporaryDefaultCardImage}
              alt=""
            />
          )}
          {partnerDetails.primaryPartner && partnerDetails.showPartnerLogo && (
            <div className="partner-logo-wrapper">
              {isLoading ? (
                <Skeleton width={90} height={42} />
              ) : (
                <img
                  // FIXME: hardcoding the edX partner logo for now until Algolia is aware of partner logos
                  src="https://prod-discovery.edx-cdn.org/organization/logos/4f8cb2c9-589b-4d1e-88c1-b01a02db3a9c-2b8dd916262f.png"
                  className="partner-logo"
                  alt={partnerDetails.primaryPartner.name}
                />
              )}
            </div>
          )}
          <div className="card-body py-3">
            <h3 className="card-title h5 mb-1">
              {isLoading ? (
                <Skeleton count={2} />
              ) : (
                <Truncate lines={3} trimWhitespace>
                  {course.title}
                </Truncate>
              )}
            </h3>
            {isLoading ? (
              <Skeleton duration={0} />
            ) : (
              <>
                {course.partners.length > 0 && (
                  <p className="partner text-muted m-0">
                    <Truncate lines={1} trimWhitespace>
                      {course.partners.join(', ')}
                    </Truncate>
                  </p>
                )}
              </>
            )}
          </div>
          <div className="card-footer bg-white border-0 pt-0 pb-2">
            {isLoading ? (
              <Skeleton duration={0} />
            ) : (
              <span className="text-muted">Course</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

const SkeletonCourseCard = () => (
  <SearchCourseCard isLoading />
);

SearchCourseCard.Skeleton = SkeletonCourseCard;

SearchCourseCard.propTypes = {
  hit: PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }),
  isLoading: PropTypes.bool,
};

SearchCourseCard.defaultProps = {
  hit: undefined,
  isLoading: false,
};

export default SearchCourseCard;
