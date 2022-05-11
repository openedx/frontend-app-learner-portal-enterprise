import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import { useHistory } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Card } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { getPrimaryPartnerLogo, isDefinedAndNotNull } from '../../utils/common';

export const COURSE_REC_EVENT_NAME = 'edx.ui.enterprise.learner_portal.recommended.course.clicked';
export const SAME_PART_EVENT_NAME = 'edx.ui.enterprise.learner_portal.same.partner.recommended.course.clicked';

const CourseRecommendationCard = ({ course, isPartnerRecommendation }) => {
  const { enterpriseConfig: { slug, uuid } } = useContext(AppContext);
  const eventName = isPartnerRecommendation ? SAME_PART_EVENT_NAME : COURSE_REC_EVENT_NAME;
  const history = useHistory();
  const linkToCourse = useMemo(
    () => {
      if (!Object.keys(course).length) {
        return '#';
      }
      return `/${slug}/course/${course.key}`;
    },
    [course],
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
      isClickable
      onClick={() => {
        sendEnterpriseTrackEvent(
          uuid,
          eventName,
          {
            courseKey: course.key,
          },
        );
        history.push(linkToCourse);
      }}
    >
      <Card.ImageCap
        src={course.cardImageUrl.src}
        logoSrc={primaryPartnerLogo.src}
        logoAlt={primaryPartnerLogo.alt}
      />

      <Card.Header
        title={(
          <Truncate lines={3} trimWhitespace>
            {course.title}
          </Truncate>
        )}
        subtitle={
          course.owners?.length > 0 && (
            <p className="partner text-muted m-0">
              <Truncate lines={1} trimWhitespace>
                {course.owners.map(partner => partner.name).join(', ')}
              </Truncate>
            </p>
          )
        }
      />

      {/* Intentionally empty section so the footer is correctly spaced at the bottom of the card */}
      <Card.Section />

      <Card.Footer>
        <small className="text-muted">Course</small>
      </Card.Footer>
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
