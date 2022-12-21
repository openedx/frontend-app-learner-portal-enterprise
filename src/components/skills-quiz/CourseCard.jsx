import React, { useContext, useMemo } from 'react';
import { Badge, Card, Stack } from '@edx/paragon';
import { useHistory } from 'react-router-dom';
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
  const history = useHistory();
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

  const primaryPartnerLogo = partnerDetails.primaryPartner && partnerDetails.showPartnerLogo ? {
    src: partnerDetails.primaryPartner.logoImageUrl,
    alt: partnerDetails.primaryPartner.name,
  } : undefined;

  const handleCardClick = () => {
    if (isLoading) {
      return;
    }
    history.push(linkToCourse(course, slug, uuid));
  };

  return (
    <Card
      isClickable
      isLoading={isLoading}
      onClick={handleCardClick}
      data-testid="skills-quiz-course-card"
    >
      <Card.ImageCap
        src={course.cardImageUrl || course.originalImageUrl}
        srcAlt=""
        logoSrc={primaryPartnerLogo?.src}
        logoAlt={primaryPartnerLogo?.alt}
      />
      <Card.Header
        title={(
          <Truncate
            lines={course.skillNames?.length < 5 ? 3 : 2}
            trimWhitespace
          >
            {course.title}
          </Truncate>
        )}
        subtitle={course.partners.length > 0 && (
          <Truncate lines={2} trimWhitespace>
            {course.partners
              .map((partner) => partner.name)
              .join(', ')}
          </Truncate>
        )}
      />
      <Card.Section>
        <Stack direction="horizontal" gap={2} className="flex-wrap">
          {course.skillNames?.length > 0 && getCommonSkills(
            course,
            allSkills,
            MAX_VISIBLE_SKILLS_COURSE,
          ).map((skill) => (
            <Badge key={skill} variant="light">
              {shortenString(
                skill,
                SKILL_NAME_CUTOFF_LIMIT,
                ELLIPSIS_STR,
              )}
            </Badge>
          ))}
        </Stack>
      </Card.Section>
    </Card>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    title: PropTypes.string.isRequired,
    cardImageUrl: PropTypes.string.isRequired,
    originalImageUrl: PropTypes.string,
    key: PropTypes.string.isRequired,
    partners: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    skillNames: PropTypes.array.isRequired,
  }).isRequired,
  allSkills: PropTypes.arrayOf(PropTypes.string).isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default CourseCard;
