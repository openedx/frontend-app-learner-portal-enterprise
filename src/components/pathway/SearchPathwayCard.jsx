import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';
import { useHistory } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import {
  Badge, Card, Stack, Truncate,
} from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  MAX_VISIBLE_SKILLS_PATHWAY,
  PATHWAY_SEARCH_EVENT_NAME,
  PATHWAY_SKILL_QUIZ_EVENT_NAME,
} from './constants';

// This function is for filtering list of skillNames in a way that returning list
// can be displayed in the form of 2 rows at max.
const filterSkillNames = (skillNames) => {
  if (!skillNames) {
    return undefined;
  }

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

const SearchPathwayCard = ({
  hit,
  isLoading,
  isSkillQuizResult,
  ...rest
}) => {
  const { enterpriseConfig: { uuid: enterpriseCustomerUUID, slug } } = useContext(AppContext);
  const history = useHistory();

  const pathway = useMemo(() => {
    if (!hit) {
      return {};
    }
    return camelCaseObject(hit);
  }, [hit]);

  const pathwayUuid = useMemo(() => {
    if (!Object.keys(pathway).length) {
      return undefined;
    }
    return pathway.aggregationKey.split(':').pop();
  }, [pathway]);

  const eventName = isSkillQuizResult ? PATHWAY_SKILL_QUIZ_EVENT_NAME : PATHWAY_SEARCH_EVENT_NAME;

  const linkToPathway = useMemo(
    () => {
      if (!Object.keys(pathway).length) {
        return undefined;
      }
      return `/${slug}/search/${pathwayUuid}`;
    },
    [pathway, pathwayUuid, slug],
  );

  const handleCardClick = () => {
    if (!linkToPathway) {
      return;
    }
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
    history.push(linkToPathway);
  };

  return (
    <Card
      data-testid="search-pathway-card"
      isClickable
      isLoading={isLoading}
      onClick={handleCardClick}
      variant="dark"
      {...rest}
    >
      <Card.ImageCap
        src={pathway?.cardImageUrl || cardFallbackImg}
        fallbackSrc={cardFallbackImg}
        alt=""
      />
      <Card.Header
        title={(
          <Truncate maxLine={3}>{pathway.title}</Truncate>
        )}
      />
      <Card.Section>
        {pathway.skillNames && (
          <Stack direction="horizontal" gap={2} className="flex-wrap">
            {filterSkillNames(pathway.skillNames).slice(0, MAX_VISIBLE_SKILLS_PATHWAY).map(skillName => (
              <Badge
                variant="light"
                key={skillName}
              >
                {skillName}
              </Badge>
            ))}
          </Stack>
        )}
      </Card.Section>
    </Card>
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
