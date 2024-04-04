import React, { useContext, useMemo } from 'react';
import {
  Badge, Card, Stack, Truncate,
} from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';

import getCommonSkills from './data/utils';
import { getLinkToCourse, shortenString } from '../course/data/utils';
import { ELLIPSIS_STR } from '../course/data/constants';
import { isDefinedAndNotNull } from '../../utils/common';
import { MAX_VISIBLE_SKILLS_COURSE, SKILL_NAME_CUTOFF_LIMIT } from './constants';
import { useEnterpriseCustomer } from '../app/data';

const CourseCard = ({
  isLoading, course, allSkills,
}) => {
  const { authenticatedUser: { userId } } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
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
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.skills_quiz.course.clicked',
      { userId, enterprise: enterpriseCustomer.slug, selectedCourse: course.key },
    );
  };

  return (
    <Card
      isClickable
      className="d-inline-flex"
      as={Link}
      to={getLinkToCourse(course, enterpriseCustomer.slug)}
      isLoading={isLoading}
      onClick={handleCardClick}
      data-testid="skills-quiz-course-card"
    >
      <Card.ImageCap
        src={course.cardImageUrl || course.originalImageUrl || cardFallbackImg}
        fallbackSrc={cardFallbackImg}
        srcAlt=""
        logoSrc={primaryPartnerLogo?.src}
        logoAlt={primaryPartnerLogo?.alt}
      />
      <Card.Header
        title={(
          <Truncate lines={course.skillNames?.length < 5 ? 3 : 2}>
            {course.title}
          </Truncate>
        )}
        subtitle={course.partners.length > 0 && (
          <Truncate lines={2}>
            {course.partners.map((partner) => partner.name).join(', ')}
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
    skillNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  allSkills: PropTypes.arrayOf(PropTypes.string).isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default CourseCard;
