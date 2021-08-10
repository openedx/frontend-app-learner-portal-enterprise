import React, { useContext, useMemo } from 'react';
import qs from 'query-string';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Badge, Card } from '@edx/paragon';

import { isDefinedAndNotNull } from '../../utils/common';
import { ELLIPSIS_STR } from '../course/data/constants';
import { shortenString } from '../course/data/utils';
import { SKILL_NAME_CUTOFF_LIMIT, MAX_VISIBLE_SKILLS_CARD } from './constants';

const SearchCourseCard = ({ hit, isLoading }) => {
  const { enterpriseConfig: { slug } } = useContext(AppContext);

  const course = hit ? camelCaseObject(hit) : {};
  const courseSkills = course.skillNames?.length > 0 ? course.skillNames.slice(0, MAX_VISIBLE_SKILLS_CARD) : null;

  const linkToCourse = useMemo(
    () => {
      if (!Object.keys(course).length) {
        return '#';
      }
      const queryParams = {
        queryId: course.queryId,
        objectId: course.objectId,
      };
      return `/${slug}/course/${course.key}?${qs.stringify(queryParams)}`;
    },
    [isLoading, JSON.stringify(course)],
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
    [JSON.stringify(course)],
  );

  return (
    <div
      className="course-card-result mb-4"
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
            { course.skillNames?.length > 0 && (
              <div className="mb-2 d-inline">
                {courseSkills?.map((skill) => (
                  <Badge
                    key={skill}
                    className="course-badge"
                    variant="light"
                  >
                    {
                      shortenString(skill, SKILL_NAME_CUTOFF_LIMIT, ELLIPSIS_STR)
                    }
                  </Badge>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </Link>
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
    skillNames: PropTypes.arrayOf(PropTypes.string),
  }),
  isLoading: PropTypes.bool,
};

SearchCourseCard.defaultProps = {
  hit: undefined,
  isLoading: false,
};

SearchCourseCard.Skeleton = SkeletonCourseCard;

export default SearchCourseCard;
