import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';
import { useHistory } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Card, Truncate } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { getPrimaryPartnerLogo, isDefinedAndNotNull } from '../../utils/common';
import { GENERAL_LENGTH_COURSE, SHORT_LENGTH_COURSE } from './data/constants';
import { isShortCourse } from './utils';

const SearchCourseCard = ({
  key, hit, isLoading, ...rest
}) => {
  const { enterpriseConfig: { slug, uuid } } = useContext(AppContext);
  const history = useHistory();

  const eventName = useMemo(
    () => {
      if (key?.startsWith('career-tab')) {
        return 'edx.ui.enterprise.learner_portal.career_tab.course_recommendation.clicked';
      }
      return 'edx.ui.enterprise.learner_portal.search.card.clicked';
    },
    [key],
  );

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
        return undefined;
      }
      const queryParams = new URLSearchParams();
      if (course.queryId && course.objectId) {
        queryParams.set('queryId', course.queryId);
        queryParams.set('objectId', course.objectId);
      }
      return `/${slug}/course/${course.key}?${queryParams.toString()}`;
    },
    [course, slug],
  );

  const partnerDetails = useMemo(
    () => {
      if (!Object.keys(course).length || !isDefinedAndNotNull(course.partners)) {
        return {};
      }

      return {
        primaryPartner: course.partners?.length > 0 ? course.partners[0] : undefined,
        showPartnerLogo: course.partners?.length === 1,
      };
    },
    [course],
  );

  const isShortLengthCourse = isShortCourse(course);

  const primaryPartnerLogo = getPrimaryPartnerLogo(partnerDetails);

  const handleCardClick = () => {
    if (!linkToCourse) {
      return;
    }
    sendEnterpriseTrackEvent(
      uuid,
      eventName,
      {
        objectID: course.objectId,
        position: course.position,
        index: getConfig().ALGOLIA_INDEX_NAME,
        queryID: course.queryId,
        courseKey: course.key,
      },
    );
    history.push(linkToCourse);
  };

  return (
    <Card
      data-testid="search-course-card"
      isLoading={isLoading}
      isClickable
      onClick={(e) => {
        handleCardClick(e);
      }}
      {...rest}
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
          <Truncate maxLine={3}>{course.title}</Truncate>
        )}
        subtitle={course.partners?.length > 0 && (
          <Truncate maxLine={2}>
            {course.partners.map(partner => partner.name).join(', ')}
          </Truncate>
        )}
      />
      <Card.Section />
      <Card.Footer textElement={(
        <span className="text-muted">
          { isShortLengthCourse ? SHORT_LENGTH_COURSE : GENERAL_LENGTH_COURSE }
        </span>
      )}
      />
    </Card>
  );
};

const SkeletonCourseCard = (props) => (
  <SearchCourseCard {...props} isLoading />
);

SearchCourseCard.propTypes = {
  hit: PropTypes.shape({
    key: PropTypes.string,
    title: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
  key: PropTypes.string,
};

SearchCourseCard.defaultProps = {
  hit: undefined,
  isLoading: false,
  key: undefined,
};

SearchCourseCard.Skeleton = SkeletonCourseCard;

export default SearchCourseCard;
