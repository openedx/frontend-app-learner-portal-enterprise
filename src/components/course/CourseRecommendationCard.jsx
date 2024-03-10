import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';
import { useNavigate } from 'react-router-dom';
import { Card, Truncate } from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { getPrimaryPartnerLogo, isDefinedAndNotNull } from '../../utils/common';
import { linkToCourse } from './data/utils';
import { useEnterpriseCustomer } from '../app/data';

export const COURSE_REC_EVENT_NAME = 'edx.ui.enterprise.learner_portal.recommended.course.clicked';
export const SAME_PART_EVENT_NAME = 'edx.ui.enterprise.learner_portal.same.partner.recommended.course.clicked';

const CourseRecommendationCard = ({ course, isPartnerRecommendation }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const eventName = isPartnerRecommendation ? SAME_PART_EVENT_NAME : COURSE_REC_EVENT_NAME;
  const navigate = useNavigate();
  const cachedLinkToCourse = useMemo(
    () => linkToCourse(course, enterpriseCustomer.slug),
    [course, enterpriseCustomer.slug],
  );

  const partnerDetails = useMemo(
    () => {
      if (!Object.keys(course).length || !isDefinedAndNotNull(course.owners)) {
        return {};
      }

      return {
        primaryPartner: course.owners?.length > 0 ? course.owners[0] : undefined,
        showPartnerLogo: course.owners?.length === 1,
      };
    },
    [course],
  );

  const primaryPartnerLogo = getPrimaryPartnerLogo(partnerDetails);

  return (
    <Card
      className="course-card-recommendation"
      isClickable
      onClick={() => {
        sendEnterpriseTrackEvent(
          enterpriseCustomer.uuid,
          eventName,
          {
            courseKey: course.key,
          },
        );
        navigate(cachedLinkToCourse);
      }}
    >
      <Card.ImageCap
        src={course.cardImageUrl.src || cardFallbackImg}
        fallbackSrc={cardFallbackImg}
        logoSrc={primaryPartnerLogo?.src}
        logoAlt={primaryPartnerLogo?.alt}
      />

      <Card.Header
        title={(
          <Truncate maxLine={3}>{course.title}</Truncate>
        )}
        subtitle={course.owners?.length > 0 && (
          <p className="partner">
            <Truncate maxLine={1}>{course.owners.map(partner => partner.name).join(', ')}</Truncate>
          </p>
        )}
      />

      {/* Intentionally empty section so the footer is correctly spaced at the bottom of the card */}
      <Card.Section />
      <Card.Footer textElement={<span className="text-muted">Course</span>} />
    </Card>
  );
};

CourseRecommendationCard.propTypes = {
  course: PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    owners: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    cardImageUrl: PropTypes.shape({
      src: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  isPartnerRecommendation: PropTypes.bool,
};

CourseRecommendationCard.defaultProps = {
  isPartnerRecommendation: false,
};

export default CourseRecommendationCard;
