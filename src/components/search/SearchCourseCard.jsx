import { useMemo } from 'react';
import PropTypes from 'prop-types';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';
import { Link } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Card, Truncate } from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { getPrimaryPartnerLogo, isDefinedAndNotNull } from '../../utils/common';
import { isShortCourse } from './utils';
import { useEnterpriseCustomer } from '../app/data';

const SearchCourseCard = ({
  key, hit, isLoading, parentRoute, ...rest
}) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const eventName = useMemo(
    () => {
      // [tech debt] `key` is not intended to be used as a prop (see warning in tests).
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
      return `/${enterpriseCustomer.slug}/course/${course.key}?${queryParams.toString()}`;
    },
    [course, enterpriseCustomer.slug],
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
      enterpriseCustomer.uuid,
      eventName,
      {
        objectID: course.objectId,
        position: course.position,
        index: getConfig().ALGOLIA_INDEX_NAME,
        queryID: course.queryId,
        courseKey: course.key,
      },
    );
  };

  return (
    <Card
      data-testid="search-course-card"
      className="d-inline-flex"
      isLoading={isLoading}
      isClickable
      as={Link}
      to={linkToCourse}
      state={{ parentRoute }}
      onClick={handleCardClick}
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
        title={(course.title && <Truncate lines={3}>{course.title}</Truncate>)}
        subtitle={course.partners?.length > 0 && (
          <Truncate lines={2}>
            {course.partners.map(partner => partner.name).join(', ')}
          </Truncate>
        )}
      />
      <Card.Section />
      <Card.Footer textElement={(
        <span className="text-muted">
          { isShortLengthCourse
            ? (
              <FormattedMessage
                id="enterprise.search.course.card.short.length.course"
                defaultMessage="Short Course"
                description="Label for short length course on course card"
              />
            )
            : (
              <FormattedMessage
                id="enterprise.search.course.card.general.length.course"
                defaultMessage="Course"
                description="Label for general length course on course card"
              />
            )}
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
  parentRoute: PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }),
};

SearchCourseCard.defaultProps = {
  hit: undefined,
  isLoading: false,
  key: undefined,
  parentRoute: undefined,
};

SearchCourseCard.Skeleton = SkeletonCourseCard;

export default SearchCourseCard;
