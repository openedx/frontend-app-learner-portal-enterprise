import React, { useContext, useMemo } from 'react';
import { Badge, Card, CardImg } from '@edx/paragon';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import Truncate from 'react-truncate';
import { AppContext } from '@edx/frontend-platform/react';
import PropTypes from 'prop-types';
import getCommonSkills, { linkToCourse } from './data/utils';
import { shortenString } from '../course/data/utils';
import { ELLIPSIS_STR } from '../course/data/constants';
import { isDefinedAndNotNull } from '../../utils/common';
import { MAX_VISIBLE_SKILLS_COURSE, SKILL_NAME_CUTOFF_LIMIT } from './constants';

const CourseCard = ({
  isLoading, course, allSkills,
}) => {
  const { enterpriseConfig } = useContext(AppContext);
  const { slug, uuid } = enterpriseConfig;
  const partnerDetails = useMemo(() => {
    const partners = {};
    if (!Object.keys(course).length || !isDefinedAndNotNull(course.partners)) {
      partners[course.key] = {};
    }
    partners[course.key] = {
      primaryPartner:
        course.partners.length > 0 ? course.partners[0] : undefined,
      showPartnerLogo: course.partners.length === 1,
    };
    return partners;
  }, [JSON.stringify(course)]);

  return (
    <div
      className="search-result-card mb-4"
      role="group"
      aria-label={course.title}
      key={course.title}
    >
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <Link to={isLoading ? '#' : linkToCourse(course, slug, uuid)}>
        <Card>
          {isLoading ? (
            <CardImg
              as={Skeleton}
              variant="top"
              duration={0}
              height={100}
              data-testid="card-img-loading"
            />
          ) : (
            <CardImg variant="top" src={course.cardImageUrl} alt="" />
          )}
          {isLoading && (
            <div className="partner-logo-wrapper">
              <Skeleton
                width={90}
                height={42}
                data-testid="partner-logo-loading"
              />
            </div>
          )}
          {!isLoading
          && partnerDetails[course.key].primaryPartner
          && partnerDetails[course.key].showPartnerLogo && (
            <div className="partner-logo-wrapper">
              <img
                src={partnerDetails[course.key].primaryPartner.logoImageUrl}
                className="partner-logo"
                alt={partnerDetails[course.key].primaryPartner.name}
              />
            </div>
          )}
          <Card.Body>
            <Card.Header
              as="h4"
              className="card-title mb-2"
              title={isLoading ? (
                <Skeleton count={2} data-testid="course-title-loading" />
              ) : (
                <Truncate
                  lines={course.skillNames?.length < 5 ? 3 : 2}
                  trimWhitespace
                >
                  {course.title}
                </Truncate>
              )}
            />

            {isLoading ? (
              <Skeleton duration={0} data-testid="partner-name-loading" />
            ) : (
              <>
                {course.partners.length > 0 && (
                  <p className="partner text-muted m-0">
                    <Truncate lines={2} trimWhitespace>
                      {course.partners
                        .map((partner) => partner.name)
                        .join(', ')}
                    </Truncate>
                  </p>
                )}
              </>
            )}
            {isLoading ? (
              <Skeleton count={1} data-testid="skills-loading" />
            ) : (
              <>
                {course.skillNames?.length > 0 && (
                  <div className="mb-2 d-inline">
                    {getCommonSkills(
                      course,
                      allSkills,
                      MAX_VISIBLE_SKILLS_COURSE,
                    )
                      .map((skill) => (
                        <Badge
                          key={skill}
                          className="skill-badge"
                          variant="light"
                        >
                          {shortenString(
                            skill,
                            SKILL_NAME_CUTOFF_LIMIT,
                            ELLIPSIS_STR,
                          )}
                        </Badge>
                      ))}
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Link>
    </div>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    title: PropTypes.string.isRequired,
    cardImageUrl: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    partners: PropTypes.shape.isRequired,
    skillNames: PropTypes.array.isRequired,
  }).isRequired,
  allSkills: PropTypes.shape.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default CourseCard;
