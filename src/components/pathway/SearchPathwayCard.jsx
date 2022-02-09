import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Badge, Card, useToggle } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import classNames from 'classnames';

import PathwayModal from './PathwayModal';

// This function is for filtering list of tags in a way that returning list
// can be displayed in the form of 2 rows at max.
const filterTags = tags => {
  // This is the maximum allowed length a tag can have.
  const singleTagSizeLimit = 45;
  const offset = 5;

  // this is the maximum cumulative length of all the tags. We need this to make sure there are maximum 2
  // rows of tags in each pathway card.
  let cumulativeTaglimit = 90;
  const tagsToReturn = [];
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];

    // Only include tags if tag length does not exceed tag-size-limit or the cumulative tag limit.
    if (tag.length < singleTagSizeLimit && tag.length <= cumulativeTaglimit) {
      tagsToReturn.push(tag);

      cumulativeTaglimit -= (tag.length + offset);
    }
  }

  return tagsToReturn;
};

const SearchPathwayCard = ({ hit, isLoading }) => {
  const { enterpriseConfig: { uuid: enterpriseCustomerUUID } } = useContext(AppContext);
  const [isLearnerPathwayModalOpen, openLearnerPathwayModal, onClose] = useToggle(false);

  const pathway = hit ? camelCaseObject(hit) : {};

  const linkToPathway = useMemo(
    () => {
      if (!Object.keys(pathway).length) {
        return '#';
      }
      return `#pathway-${pathway.uuid}`;
    },
    [isLoading, JSON.stringify(pathway)],
  );

  return (
    <div
      className="search-pathway-card mb-4"
      role="group"
      aria-label={pathway.title}
    >
      <PathwayModal
        learnerPathwayUuid={pathway.uuid}
        isOpen={isLearnerPathwayModalOpen}
        onClose={onClose}
      />

      <Link
        to={linkToPathway}
        onClick={() => {
          openLearnerPathwayModal();
          sendEnterpriseTrackEvent(
            enterpriseCustomerUUID,
            'edx.ui.enterprise.learner_portal.search.pathway.card.clicked',
            {
              objectID: pathway.objectId,
              position: pathway.position,
              index: getConfig().ALGOLIA_INDEX_NAME,
              queryID: pathway.queryId,
              pathwayUUID: pathway.uuid,
            },
          );
        }}
      >
        <Card>
          {isLoading ? (
            <Card.Img
              as={Skeleton}
              variant="top"
              duration={0}
              height={100}
              data-testid="card-img-loading"
            />
          ) : (
            <Card.Img
              variant="top"
              src={pathway.cardImageUrl}
              alt=""
            />
          )}
          {isLoading && (
            <div className="partner-logo-wrapper">
              <Skeleton width={90} height={42} data-testid="partner-logo-loading" />
            </div>
          )}
          <Card.Body>
            <Card.Title as="h4" className="card-title mb-1">
              {isLoading ? (
                <Skeleton count={2} data-testid="pathway-title-loading" />
              ) : (
                <Truncate lines={3} trimWhitespace>
                  {pathway.title}
                </Truncate>
              )}
            </Card.Title>
            {isLoading ? (
              <Skeleton duration={0} data-testid="content-type-loading" />
            ) : (
              <div className="d-flex pathway-tags">
                {pathway.tags && filterTags(pathway.tags).map(
                  tag => (
                    <Badge
                      variant="light"
                      key={tag}
                      className={classNames(
                        'pathway-badge d-flex justify-content-center align-items-center mb-2',
                      )}
                    >
                      <span className="badge-text"> {tag}</span>
                    </Badge>
                  ),
                )}
              </div>
            )}

          </Card.Body>
        </Card>
      </Link>
    </div>
  );
};

const SkeletonPathwayCard = (props) => (
  <SearchPathwayCard {...props} isLoading />
);

SearchPathwayCard.propTypes = {
  hit: PropTypes.shape({
    uuid: PropTypes.string,
    cardImageUrl: PropTypes.string,
    title: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
  isLoading: PropTypes.bool,
};

SearchPathwayCard.defaultProps = {
  hit: undefined,
  isLoading: false,
};

SearchPathwayCard.Skeleton = SkeletonPathwayCard;

export default SearchPathwayCard;
