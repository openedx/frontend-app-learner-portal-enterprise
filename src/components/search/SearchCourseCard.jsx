import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Card } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { getPrimaryPartnerLogo, isDefinedAndNotNull } from '../../utils/common';
import { GENERAL_LENGTH_COURSE, SHORT_LENGTH_COURSE } from './data/constants';
import { isShortCourse } from './utils';

const SearchCourseCard = ({ hit, isLoading, ...rest }) => {
  const { enterpriseConfig: { slug, uuid } } = useContext(AppContext);
  const navigate = useNavigate();

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
      'edx.ui.enterprise.learner_portal.search.card.clicked',
      {
        objectID: course.objectId,
        position: course.position,
        index: getConfig().ALGOLIA_INDEX_NAME,
        queryID: course.queryId,
        courseKey: course.key,
      },
    );
    navigate(linkToCourse);
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
        src={course.cardImageUrl || course.originalImageUrl}
        srcAlt=""
        logoSrc={primaryPartnerLogo?.src}
        logoAlt={primaryPartnerLogo?.alt}
      />
      <Card.Header
        title={(
          <Truncate lines={3} trimWhitespace>
            {course.title}
          </Truncate>
        )}
        subtitle={course.partners?.length > 0 && (
          <Truncate lines={2} trimWhitespace>
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
};

SearchCourseCard.defaultProps = {
  hit: undefined,
  isLoading: false,
};

SearchCourseCard.Skeleton = SkeletonCourseCard;

export default SearchCourseCard;
