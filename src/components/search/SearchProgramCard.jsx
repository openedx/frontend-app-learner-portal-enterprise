import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Badge, Card, Icon } from '@edx/paragon';
import { Program } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { isDefinedAndNotNull } from '../../utils/common';

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

  const { userId } = getAuthenticatedUser();
  return (
    <div
      className="search-program-card mb-4"
      role="group"
      aria-label={program.title}
    >
      <Link
        to={linkToProgram}
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
              src={program.cardImageUrl}
              alt=""
            />
          )}
          {isLoading && (
            <div className="partner-logo-wrapper">
              <Skeleton width={90} height={42} data-testid="partner-logo-loading" />
            </div>
          )}
          {(!isLoading && partnerDetails.primaryPartner && partnerDetails.showPartnerLogo) && (
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
              {isLoading ? (
                <Skeleton count={2} data-testid="program-title-loading" />
              ) : (
                <Truncate lines={2} trimWhitespace>
                  {program.title}
                </Truncate>
              )}
            </Card.Title>
            {isLoading ? (
              <Skeleton duration={0} data-testid="partner-key-loading" />
            ) : (
              <>
                {program.authoringOrganizations?.length > 0 && (
                  <p className="partner text-muted m-0">
                    <Truncate lines={1} trimWhitespace>
                      {program.authoringOrganizations.map(org => org.key).join(', ')}
                    </Truncate>
                  </p>
                )}
              </>
            )}
          </Card.Body>
          <Card.Footer className="bg-white border-0 pt-0 pb-2">
            {isLoading ? (
              <Skeleton duration={0} data-testid="program-type-loading" />
            ) : (
              <div className="d-flex">
                <Badge
                  variant="light"
                  className={classNames(
                    'program-badge d-flex justify-content-center align-items-center text-primary-500',
                    { 'mb-2': program.courseKeys?.length > 1 },
                    { 'mb-4': program.courseKeys?.length <= 1 },
                  )}
                >
                  <Icon src={Program} className="badge-icon" />
                  <span className="badge-text">
                    <ProgramType type={program.type} />
                  </span>
                </Badge>
              </div>
            )}
            {isLoading ? (
              <Skeleton duration={0} data-testid="program-courses-count-loading" />
            ) : (
              <>
                {program.courseKeys?.length > 0 && (
                  <span className="program-courses-count-text">{program.courseKeys.length} Courses</span>
                )}
              </>
            )}
          </Card.Footer>
        </Card>
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
