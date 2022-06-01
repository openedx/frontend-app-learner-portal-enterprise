import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Badge, Card, Icon } from '@edx/paragon';
import { Program } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { getPrimaryPartnerLogo, isDefinedAndNotNull } from '../../utils/common';

export const ProgramType = ({ type }) => {
  let programTypeToDisplay = type;

  switch (type) {
    case 'MicroBachelors':
    case 'MicroMasters':
      programTypeToDisplay = <>{type}<sup className="superscript">®</sup> Program</>;
      break;
    case 'XSeries':
      programTypeToDisplay = <>{type} Program</>;
      break;
    case 'Masters':
      programTypeToDisplay = <>Master&apos;s Degree Program</>;
      break;
    case 'Professional Certificate':
      programTypeToDisplay = <>{type}</>;
      break;
    default:
      programTypeToDisplay = <>{type}</>;
  }

  return programTypeToDisplay;
};

const SearchProgramCard = ({ hit, isLoading }) => {
  const { enterpriseConfig: { slug, uuid } } = useContext(AppContext);
  const program = hit ? camelCaseObject(hit) : {};
  const programUuid = Object.keys(program).length ? program.aggregationKey.split(':').pop() : undefined;

  const linkToProgram = useMemo(
    () => {
      if (!Object.keys(program).length) {
        return '#';
      }

      return `/${slug}/program/${programUuid}`;
    },
    [isLoading, JSON.stringify(program)],
  );

  const partnerDetails = useMemo(
    () => {
      if (!Object.keys(program).length || !isDefinedAndNotNull(program.authoringOrganizations)) {
        return {};
      }

      return {
        primaryPartner: program.authoringOrganizations?.length > 0 ? program.authoringOrganizations[0] : undefined,
        showPartnerLogo: program.authoringOrganizations?.length === 1,
      };
    },
    [JSON.stringify(program)],
  );

  const loadingCard = () => (
    <Card>
      <Card.ImageCap
        as={Skeleton}
        duration={0}
      />

      <Card.Header
        title={
          <Skeleton duration={0} data-testid="program-title-loading" />
        }
      />

      <Card.Section>
        <Skeleton duration={0} data-testid="program-type-loading" />
      </Card.Section>

      <Card.Footer className="bg-white border-0 pt-0 pb-2">
        <Skeleton duration={0} data-testid="program-courses-count-loading" />
      </Card.Footer>
    </Card>
  );

  const searchProgramCard = () => {
    const getProgramCourseCount = () => {
      const numCourses = program.courseKeys?.length || 0;
      if (!numCourses) {
        return undefined;
      }
      return `${numCourses} ${numCourses > 1 ? 'Courses' : 'Course'}`;
    };
    const primaryPartnerLogo = getPrimaryPartnerLogo(partnerDetails);

    /*
      AED 2022-06-01: We can't yet use a CardGrid or CardDeck to contain these
      cards/hits (and thus take advantage of the Grid or Deck forcing
      the cards to be equal heights),
      so we set height to 100% for the card, image/header sub-components,
      and the Link and div in which the card is wrapped.
      This will cause the card to fill up the static height we've allocated
      to search result items in ``_SearchResults.scss``.
    */
    return (
      <Card
        isClickable
        className="h-100"
      >
        <Card.ImageCap
          className="h-100"
          src={program.cardImageUrl}
          alt=""
          logoSrc={primaryPartnerLogo?.src}
          logoAlt={primaryPartnerLogo?.alt}
        />

        <Card.Header
          className="h-100"
          title={(
            <Truncate lines={2} trimWhitespace>
              {program.title}
            </Truncate>
          )}
          subtitle={
            program.authoringOrganizations?.length > 0 && (
              <p className="small partner text-muted m-0">
                <Truncate lines={1} trimWhitespace>
                  {program.authoringOrganizations.map(org => org.key).join(', ')}
                </Truncate>
              </p>
            )
          }
        />

        <Card.Section className="py-3">
          <div className="d-flex">
            <Badge
              variant="light"
              className="d-flex justify-content-center align-items-center text-primary-500"
            >
              <Icon src={Program} className="badge-icon" />
              <div>
                <span className="badge-text">
                  <ProgramType type={program.type} />
                </span>
              </div>
            </Badge>
          </div>
        </Card.Section>

        <Card.Footer
          textElement={getProgramCourseCount()}
        />
      </Card>
    );
  };

  const { userId } = getAuthenticatedUser();
  return (
    <div
      className="search-program-card mb-4 h-100"
      role="group"
      aria-label={program.title}
    >
      <Link
        to={linkToProgram}
        className="h-100"
        onClick={() => {
          sendEnterpriseTrackEvent(
            uuid,
            'edx.ui.enterprise.learner_portal.search.program.card.clicked',
            {
              userId,
              programUuid,
            },
          );
        }}
      >
        {isLoading ? loadingCard() : searchProgramCard()}
      </Link>
    </div>
  );
};

const SkeletonProgramCard = (props) => (
  <SearchProgramCard {...props} isLoading />
);

SearchProgramCard.propTypes = {
  hit: PropTypes.shape({
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    aggregation_key: PropTypes.string.isRequired,
    authoring_organizations: PropTypes.shape({
      key: PropTypes.string.isRequired,
      logo_image_url: PropTypes.string.isRequired,
    }).isRequired,
    card_image_url: PropTypes.string.isRequired,
    course_keys: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
  isLoading: PropTypes.bool,
};

SearchProgramCard.defaultProps = {
  hit: undefined,
  isLoading: false,
};

SearchProgramCard.Skeleton = SkeletonProgramCard;

export default SearchProgramCard;
