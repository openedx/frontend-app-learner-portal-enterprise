import React, { useContext, useMemo } from 'react';
import { Badge, Card } from '@edx/paragon';
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

function CourseCard({
  isLoading, course, allSkills,
}) {
  const { enterpriseConfig } = useContext(AppContext);
  const { slug, uuid } = enterpriseConfig;
  const partnerDetails = useMemo(() => {
    if (!Object.keys(course).length || !isDefinedAndNotNull(course.partners)) {
      return {};
    }
    return {
      primaryPartner: course.partners.length > 0 ? course.partners[0] : undefined,
      showPartnerLogo: course.partners.length === 1,
    };
  }, [course]);

  const loadingCard = () => (
    <Card>
      <Card.ImageCap
        as={Skeleton}
        duration={0}
      />

      <Card.Header
        title={
          <Skeleton count={2} data-testid="course-title-loading" />
        }
      />

      <Card.Section>
        <Skeleton duration={0} data-testid="partner-name-loading" />
      </Card.Section>

      <Card.Section>
        <Skeleton count={1} data-testid="skills-loading" />
      </Card.Section>
    </Card>
  );

  const courseCard = () => {
    const primaryPartnerLogo = partnerDetails.primaryPartner && partnerDetails.showPartnerLogo ? {
      src: partnerDetails.primaryPartner.logoImageUrl,
      alt: partnerDetails.primaryPartner.name,
    } : undefined;

    return (
      <Card isClickable>
        <Card.ImageCap
          src={course.cardImageUrl}
          srcAlt=""
          logoSrc={primaryPartnerLogo?.src}
          logoAlt={primaryPartnerLogo?.alt}
        />

        <Card.Header
          className="h-100"
          title={(
            <Truncate
              lines={course.skillNames?.length < 5 ? 3 : 2}
              trimWhitespace
            >
              {course.title}
            </Truncate>
          )}
          subtitle={
            course.partners.length > 0 && (
              <p className="partner text-muted m-0">
                <Truncate lines={2} trimWhitespace>
                  {course.partners
                    .map((partner) => partner.name)
                    .join(', ')}
                </Truncate>
              </p>
            )
          }
        />

        <Card.Section className="py-1">
          {course.skillNames?.length > 0 && (
            <div className="mb-2">
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
        </Card.Section>
      </Card>
    );
  };

  return (
    <div
      className="search-result-card mb-4"
      role="group"
      aria-label={course.title}
      key={course.title}
    >
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <Link
        to={isLoading ? '#' : linkToCourse(course, slug, uuid)}
        className="h-100"
      >
        {isLoading ? loadingCard() : courseCard()}
      </Link>
    </div>
  );
}

CourseCard.propTypes = {
  course: PropTypes.shape({
    title: PropTypes.string.isRequired,
    cardImageUrl: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    partners: PropTypes.shape.isRequired,
    skillNames: PropTypes.shape([]).isRequired,
  }).isRequired,
  allSkills: PropTypes.shape.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default CourseCard;
