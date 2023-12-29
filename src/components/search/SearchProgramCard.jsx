import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';
import { useHistory } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import {
  Badge, Card, Icon, Truncate,
} from '@openedx/paragon';
import { Program } from '@openedx/paragon/icons';
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
      programTypeToDisplay = type;
      break;
    default:
      programTypeToDisplay = type;
  }

  return programTypeToDisplay;
};

const SearchProgramCard = ({ hit, isLoading, ...rest }) => {
  const history = useHistory();
  const { enterpriseConfig: { slug, uuid } } = useContext(AppContext);
  const program = useMemo(() => {
    if (!hit) {
      return {};
    }
    return camelCaseObject(hit);
  }, [hit]);

  const programUuid = program?.aggregationKey?.split(':').pop();

  const linkToProgram = useMemo(
    () => {
      if (!programUuid) {
        return '#';
      }
      return `/${slug}/program/${programUuid}`;
    },
    [programUuid, slug],
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
    [program],
  );

  const getProgramCourseCount = () => {
    const numCourses = program.courseKeys?.length || 0;
    if (!numCourses) {
      return undefined;
    }
    return `${numCourses} ${numCourses > 1 ? 'Courses' : 'Course'}`;
  };

  const primaryPartnerLogo = getPrimaryPartnerLogo(partnerDetails);
  const { userId } = getAuthenticatedUser();

  const handleCardClick = () => {
    sendEnterpriseTrackEvent(
      uuid,
      'edx.ui.enterprise.learner_portal.search.program.card.clicked',
      {
        userId,
        programUuid,
      },
    );
    history.push(linkToProgram);
  };

  return (
    <Card
      isLoading={isLoading}
      isClickable
      onClick={handleCardClick}
      variant="dark"
      data-testid="search-program-card"
      {...rest}
    >
      <Card.ImageCap
        src={program.cardImageUrl || cardFallbackImg}
        fallbackSrc={cardFallbackImg}
        alt=""
        logoSrc={primaryPartnerLogo?.src}
        logoAlt={primaryPartnerLogo?.alt}
      />
      <Card.Header
        title={(
          <Truncate maxLine={3}>{program.title}</Truncate>
        )}
        subtitle={
          program.authoringOrganizations?.length > 0 && (
            <Truncate maxLine={2}>
              {program.authoringOrganizations.map(org => org.key).join(', ')}
            </Truncate>
          )
        }
      />
      <Card.Section>
        <Badge
          variant="light"
          className="text-primary-500"
          data-testid="program-type-badge"
        >
          <div className="d-flex align-items-center">
            <Icon src={Program} className="mr-1" />
            <ProgramType type={program.type || null} />
          </div>
        </Badge>
      </Card.Section>
      <Card.Footer textElement={getProgramCourseCount()} />
    </Card>
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
    authoring_organizations: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      logo_image_url: PropTypes.string.isRequired,
    })).isRequired,
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
