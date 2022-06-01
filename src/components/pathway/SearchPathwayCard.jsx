import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Badge, Card } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import classNames from 'classnames';

import { MAX_VISIBLE_SKILLS_PATHWAY, PATHWAY_SEARCH_EVENT_NAME, PATHWAY_SKILL_QUIZ_EVENT_NAME } from './constants';

// This function is for filtering list of skillNames in a way that returning list
// can be displayed in the form of 2 rows at max.
const filterSkillNames = skillNames => {
  // This is the maximum allowed length a skillNames can have.
  const singleSkillNameSizeLimit = 40;
  const offset = 5;

  // this is the maximum cumulative length of all the skillNames. We need this to make sure there are maximum 2
  // rows of skillNames in each pathway card.
  let cumulativeSkillLimit = 90;
  const skillsToReturn = [];
  for (let i = 0; i < skillNames.length; i++) {
    const skillName = skillNames[i];

    // Only include skillNames if skillName length doesn't exceed skillName-size-limit or the cumulative skillName limit
    if (skillName.length < singleSkillNameSizeLimit && skillName.length <= cumulativeSkillLimit) {
      skillsToReturn.push(skillName);

      cumulativeSkillLimit -= (skillName.length + offset);
    }
  }

  return skillsToReturn;
};

const SearchPathwayCard = ({ hit, isLoading, isSkillQuizResult }) => {
  const { enterpriseConfig: { uuid: enterpriseCustomerUUID, slug } } = useContext(AppContext);
  const pathway = hit ? camelCaseObject(hit) : {};

  const pathwayUuid = Object.keys(pathway).length ? pathway.aggregationKey.split(':').pop() : undefined;
  const eventName = isSkillQuizResult ? PATHWAY_SKILL_QUIZ_EVENT_NAME : PATHWAY_SEARCH_EVENT_NAME;
  const linkToPathway = useMemo(
    () => {
      if (!Object.keys(pathway).length) {
        return '#';
      }
      return `/${slug}/search/${pathwayUuid}`;
    },
    [isLoading, JSON.stringify(pathway)],
  );

  const loadingCard = () => (
    <Card
      className={classNames({ 'skill-quiz-pathway-card': isSkillQuizResult })}
    >
      <Card.ImageCap
        as={Skeleton}
        duration={0}
      />

      <Card.Header
        title={
          <Skeleton count={2} data-testid="pathway-title-loading" />
        }
      />

      <Card.Section>
        <Skeleton duration={0} data-testid="content-type-loading" />
      </Card.Section>

    </Card>
  );

  const searchPathwayCard = () => (
    <Card
      isClickable
    >
      <Card.ImageCap
        src={pathway?.cardImageUrl || ''}
        alt=""
      />

      <Card.Header
        title={(
          <Truncate lines={3} trimWhitespace>
            {pathway.title}
          </Truncate>
        )}
      />

      <Card.Section classNames="py-3">
        <div className="flex-wrap pathway-skill-names">
          {pathway.skillNames
           && filterSkillNames(pathway.skillNames).slice(0, MAX_VISIBLE_SKILLS_PATHWAY).map(
             skillName => (
               <>
                 <Badge
                   variant="light"
                   key={skillName}
                   classNames="pathway-badge justify-content-center align-items-center"
                 >
                   <span className="badge-text">{skillName}</span>
                 </Badge>
                 {'   '}
               </>
             ),
           )}
        </div>
      </Card.Section>
    </Card>
  );

  return (
    <div
      className="search-pathway-card mb-4"
      role="group"
      aria-label={pathway.title}
    >
      <Link
        to={linkToPathway}
        onClick={() => {
          sendEnterpriseTrackEvent(
            enterpriseCustomerUUID,
            eventName,
            {
              objectID: pathway.objectId,
              position: pathway.position,
              index: getConfig().ALGOLIA_INDEX_NAME,
              queryID: pathway.queryId,
              pathwayUUID: pathwayUuid,
            },
          );
        }}
      >
        {isLoading ? loadingCard() : searchPathwayCard()}
      </Link>
    </div>
  );
};

const SkeletonPathwayCard = (props) => (
  <SearchPathwayCard {...props} isLoading />
);

SearchPathwayCard.propTypes = {
  hit: PropTypes.shape({
    aggregation_key: PropTypes.string,
    card_image_url: PropTypes.string,
    title: PropTypes.string,
    skill_names: PropTypes.arrayOf(PropTypes.string),
  }),
  isLoading: PropTypes.bool,
  isSkillQuizResult: PropTypes.bool,
};

SearchPathwayCard.defaultProps = {
  hit: undefined,
  isLoading: false,
  isSkillQuizResult: false,
};

SearchPathwayCard.Skeleton = SkeletonPathwayCard;

export default SearchPathwayCard;
