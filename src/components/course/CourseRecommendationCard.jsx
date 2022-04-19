import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Card } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { isDefinedAndNotNull } from '../../utils/common';

export const COURSE_REC_EVENT_NAME = 'edx.ui.enterprise.learner_portal.recommended.course.clicked';
export const SAME_PART_EVENT_NAME = 'edx.ui.enterprise.learner_portal.same.partner.recommended.course.clicked';

const CourseRecommendationCard = ({ course, isPartnerRecommendation }) => {
  const { enterpriseConfig: { slug, uuid } } = useContext(AppContext);
  const eventName = isPartnerRecommendation ? SAME_PART_EVENT_NAME : COURSE_REC_EVENT_NAME;
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

  return (
    <div
      className="course-card-recommendation mb-4"
      role="group"
      aria-label={course.title}
    >
      <Link
        to={linkToCourse}
        onClick={() => {
          sendEnterpriseTrackEvent(
            uuid,
            eventName,
            {
              courseKey: course.key,
            },
          );
        }}
      >
        <Card>
          <Card.Img
            variant="top"
            src={course.cardImageUrl.src}
            alt=""
          />
          {partnerDetails.primaryPartner && partnerDetails.showPartnerLogo && (
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
              <Truncate lines={3} trimWhitespace>
                {course.title}
              </Truncate>
            </Card.Title>
            <>
              {course.owners?.length > 0 && (
                <p className="partner text-muted m-0">
                  <Truncate lines={1} trimWhitespace>
                    {course.owners.map(partner => partner.name).join(', ')}
                  </Truncate>
                </p>
              )}
            </>
          </Card.Body>
          <Card.Footer className="bg-white border-0 pt-0 pb-2">
            <span className="text-muted">Course</span>
          </Card.Footer>
        </Card>
      </Link>
    </div>
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
