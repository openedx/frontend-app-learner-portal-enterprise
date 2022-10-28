import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Card } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { getPrimaryPartnerLogo, isDefinedAndNotNull } from '../../utils/common';

const SearchCourseCard = ({ hit, isLoading }) => {
  const { enterpriseConfig: { slug, uuid } } = useContext(AppContext);

  const course = useMemo(() => (hit ? camelCaseObject(hit) : {}), [hit]);

  const linkToCourse = useMemo(
    () => {
      if (!Object.keys(course).length) {
        return '#';
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

  const loadingCard = () => (
    <Card>
      <Card.ImageCap
        as={Skeleton}
        duration={0}
      />

      <Card.Header
        title={
          <Skeleton duration={0} data-testid="course-title-loading" />
        }
      />

      <Card.Section>
        <Skeleton duration={0} data-testid="partner-name-loading" />
      </Card.Section>

      <Card.Footer className="bg-white border-0 pt-0 pb-2">
        <Skeleton duration={0} data-testid="content-type-loading" />
      </Card.Footer>

    </Card>
  );

  /*
    AED 2022-06-01: We can't yet use a CardGrid or CardDeck to contain these
    cards/hits (and thus take advantage of the Grid or Deck forcing
    the cards to be equal heights),
    so we set height to 100% for the card, image/header sub-components,
    and the Link and div in which the card is wrapped.
    This will cause the card to fill up the static height we've allocated
    to search result items in ``_SearchResults.scss``.
  */
  const searchCourseCard = () => {
    const primaryPartnerLogo = getPrimaryPartnerLogo(partnerDetails);

    return (
      <Card
        isClickable
        className="h-100"
      >
        <Card.ImageCap
          className="h-100"
          src={course.cardImageUrl}
          srcAlt=""
          logoSrc={primaryPartnerLogo?.src}
          logoAlt={primaryPartnerLogo?.alt}
        />

        <Card.Header
          className="h-100"
          title={(
            <Truncate lines={3} trimWhitespace>
              {course.title}
            </Truncate>
          )}
        />

        <Card.Section
          className="py-3"
        >
          {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
          <>
            {course.partners?.length > 0 && (
              <p className="partner text-muted m-0">
                <Truncate lines={1} trimWhitespace>
                  {course.partners.map(partner => partner.name).join(', ')}
                </Truncate>
              </p>
            )}
          </>
        </Card.Section>

        <Card.Footer textElement={
          <span className="text-muted">Course</span>
        }
        />
      </Card>
    );
  };

  return (
    <div
      className="search-course-card mb-4 h-100"
      role="group"
      aria-label={course.title}
    >
      <Link
        className="h-100"
        to={linkToCourse}
        onClick={() => {
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
        }}
      >
        {isLoading ? loadingCard() : searchCourseCard()}
      </Link>
    </div>
  );
};

const SkeletonCourseCard = (props) => <SearchCourseCard {...props} isLoading />;

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
